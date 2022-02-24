const mongoose = require('mongoose')
const helper = require('./helpers')

const supertest = require('supertest')
const app = require('../server')
const { Model: Feedback } = require('../server/api/v1/feedback/model')
const { Model: User } = require('../server/api/v1/users/model')

const api = supertest(app)
const FEEDBACK_ENDPOINT = '/api/v1/feedback'
const USERS_ENDPOINT = '/api/v1/users'

beforeEach(async () => {
  await Feedback.deleteMany({})
  await Feedback.insertMany(helper.initialFeedback)
})

// jest.setTimeout(10000) //in case I need more than the 5000 default time
// https://github.com/visionmedia/supertest/issues/398

const hook = (method = 'post') => (url, payload = {}, token = '') => {
  return api[method](url)
    .send(payload)
    .set('Authorization', `Bearer ${token}`)
}
const request = {
  post: hook('post'),
  get: hook('get'),
  put: hook('put'),
  delete: hook('delete')
}

describe('when there is initially some feedback submissions', () => {
  test('feedback is returned as json', async () => {
    await api
      .get(FEEDBACK_ENDPOINT)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  test('all feedback submissions are returned', async () => {
    const { body: { data } } = await api.get(FEEDBACK_ENDPOINT)
    expect(data).toHaveLength(helper.initialFeedback.length)
  })
  test('a specific feedback submission is within the returned submissions', async () => {
    const { body: { data } } = await api.get(FEEDBACK_ENDPOINT)
    const titles = data.map((f) => f.title)
    expect(titles).toContain('Add a dark theme option')
  })
})

describe('viewing a specific feedback submission', () => {
  test('succeeds with a valid id', async () => {
    const feedbackAtStart = await helper.feedbackInDb()
    const feedbacktoView = feedbackAtStart[0]
    const { body: { data: searchedFeedback } } = await api
      .get(`${FEEDBACK_ENDPOINT}/${feedbacktoView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const processedFeedbackToView = JSON.parse(JSON.stringify(feedbacktoView))
    expect(searchedFeedback).toEqual(processedFeedbackToView)
  })
  test('fails with statuscode 404 if feedback does not exist', async () => {
    const validNoneExistingId = await helper.nonExistingId()
    await api.get(`${FEEDBACK_ENDPOINT}/${validNoneExistingId}`).expect(404)
  })
  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api.get(`${FEEDBACK_ENDPOINT}/${invalidId}`).expect(400)
  })
})

describe('addition of a new feedback submission by authenticated user', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const createUser = {
      username: 'suyeliza',
      password: 'locaza',
      name: 'Susy',
      lastname: 'Rodriguez',
      email: 'suyeliza@gmail.com'
    }
    await request.post(`${USERS_ENDPOINT}`, createUser)
  })
  test('succeeds with valid data', async () => {
    const { body: { data } } = await api.get(USERS_ENDPOINT)
    const { body: { data: { token } } } = await request
      .post(`${USERS_ENDPOINT}/login`, { username: data[0].username, password: 'locaza' })
    const newFeedback = {
      title: 'Add downvotes for submissions',
      description: 'It will help users to share their opinion about the feedback',
      tag: 'feature'
    }
    await request
      .post(FEEDBACK_ENDPOINT, newFeedback, token)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const feedbackAtEnd = await helper.feedbackInDb()
    expect(feedbackAtEnd).toHaveLength(helper.initialFeedback.length + 1)

    const titles = feedbackAtEnd.map((n) => n.title)

    expect(titles).toContain('Ability to follow others')
  })
  test('fails with status code 400 if data is invalid', async () => {
    const { body: { data } } = await api.get(USERS_ENDPOINT)
    const { body: { data: { token } } } = await api
      .post(`${USERS_ENDPOINT}/login`)
      .send({ username: data[0].username, password: 'locaza' })

    const newFeedback = {
      title: 'This submission doesn\'t include description nor tag'
    }
    await request
      .post(FEEDBACK_ENDPOINT, newFeedback, token)
      .expect(400)

    const feedbackAtEnd = await helper.feedbackInDb()

    expect(feedbackAtEnd).toHaveLength(helper.initialFeedback.length)
  })
})

describe('deletion of a feedback submission by authenticated user', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const createUser = {
      username: 'suyeliza',
      password: 'locaza',
      name: 'Susy',
      lastname: 'Rodriguez',
      email: 'suyeliza@gmail.com'
    }
    await request.post(`${USERS_ENDPOINT}`, createUser)
  })
  test('succeeds with status code 200 if id is valid and returns back the deleted submission', async () => {
    const { body: { data } } = await api.get(USERS_ENDPOINT)
    const { body: { data: { token } } } = await request
      .post(`${USERS_ENDPOINT}/login`, { username: data[0].username, password: 'locaza' })
    const newFeedback = {
      title: 'Add downvotes for submissions',
      description: 'It will help users to share their opinion about the feedback',
      tag: 'feature'
    }
    const { body: { data: feedbackToDelete } } = await request
      .post(FEEDBACK_ENDPOINT, newFeedback, token)

    const { body: { data: deletedFeedback } } = await request
      .delete(`${FEEDBACK_ENDPOINT}/${feedbackToDelete.id}`, {}, token)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(deletedFeedback.title).toEqual(feedbackToDelete.title)
  })
})

describe('updating upvotes of a feedback submission by authenticated user', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const createUser = {
      username: 'suyeliza',
      password: 'locaza',
      name: 'Susy',
      lastname: 'Rodriguez',
      email: 'suyeliza@gmail.com'
    }
    await request.post(`${USERS_ENDPOINT}`, createUser)
  })
  test('via the upvote endpoint adds one upvote to the total', async () => {
    const { body: { data } } = await api.get(USERS_ENDPOINT)
    const { body: { data: { token } } } = await request
      .post(`${USERS_ENDPOINT}/login`, { username: data[0].username, password: 'locaza' })
    const newFeedback = {
      title: 'Add downvotes for submissions',
      description: 'It will help users to share their opinion about the feedback',
      tag: 'feature'
    }
    const { body: { data: feedbacktoUpvote } } = await request
      .post(FEEDBACK_ENDPOINT, newFeedback, token)

    const { body: { data: updatedFeedback } } = await request
      .put(`${FEEDBACK_ENDPOINT}/${feedbacktoUpvote.id}/upvote`, {}, token)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(updatedFeedback.upvotes).toBe(2)
  })
  test('via the update endpoint has no effect ', async () => {
    const { body: { data } } = await api.get(USERS_ENDPOINT)
    const { body: { data: { token } } } = await request
      .post(`${USERS_ENDPOINT}/login`, { username: data[0].username, password: 'locaza' })
    const newFeedback = {
      title: 'Add downvotes for submissions',
      description: 'It will help users to share their opinion about the feedback',
      tag: 'feature'
    }
    const { body: { data: feedbacktoUpvote } } = await request
      .post(FEEDBACK_ENDPOINT, newFeedback, token)

    // const { body: { data: updatedFeedback } } =
    await request
      .put(`${FEEDBACK_ENDPOINT}/${feedbacktoUpvote.id}`, { upvotes: 999 }, token)
      .expect(400)
      // .expect('Content-Type', /application\/json/)
    // expect(updatedFeedback.upvotes).toBe(1)
  })
})

describe('sorting feedback submissions', () => {
  test('by upvotes returns sorted submissions in descending order by default', async () => {
    const feedbackAtStart = await helper.feedbackInDb()
    const willBeSecondLeastUpvoted = feedbackAtStart[1]
    const willBeMostUpvoted = feedbackAtStart[2]
    await api.put(`${FEEDBACK_ENDPOINT}/${willBeSecondLeastUpvoted.id}/upvote`)
    await api.put(`${FEEDBACK_ENDPOINT}/${willBeMostUpvoted.id}/upvote`)
    await api.put(`${FEEDBACK_ENDPOINT}/${willBeMostUpvoted.id}/upvote`)
    const feedbackAtEnd = await helper.feedbackInDb()
    const upvotes = feedbackAtEnd.map(f => f.upvotes)
    upvotes.sort((a, b) => b - a)
    const { body: { data } } = await api.get(`${FEEDBACK_ENDPOINT}?sortBy=upvotes`)
    const responseUpvotes = data.map(f => f.upvotes)
    expect(upvotes).toEqual(responseUpvotes)
  })
  test('by upvotes and direction ascending returns sorted submissions in ascending order', async () => {
    const feedbackAtStart = await helper.feedbackInDb()
    const willBeSecondLeastUpvoted = feedbackAtStart[1]
    const willBeMostUpvoted = feedbackAtStart[2]
    await api.put(`${FEEDBACK_ENDPOINT}/${willBeSecondLeastUpvoted.id}/upvote`)
    await api.put(`${FEEDBACK_ENDPOINT}/${willBeMostUpvoted.id}/upvote`)
    await api.put(`${FEEDBACK_ENDPOINT}/${willBeMostUpvoted.id}/upvote`)
    const feedbackAtEnd = await helper.feedbackInDb()
    const upvotes = feedbackAtEnd.map(f => f.upvotes)
    upvotes.sort((a, b) => a - b)
    const { body: { data } } = await api.get(`${FEEDBACK_ENDPOINT}?sortBy=upvotes&direction=asc`)
    const responseUpvotes = data.map(f => f.upvotes)
    expect(upvotes).toEqual(responseUpvotes)
  })
})

describe('filtering feedback submissions', () => {
  test('by tag "feature" returns only the ones with "feature" as tag', async () => {
    const feedbackAtStart = await helper.feedbackInDb()
    const taggedSubmissionIds = feedbackAtStart.filter(f => f.tag === 'feature').map(f => f.id)
    const { body: { data: taggedFeedback } } = await api.get(`${FEEDBACK_ENDPOINT}?tag=feature`)
    const taggedFeedbackIds = taggedFeedback.map(f => f.id)
    expect(taggedSubmissionIds.sort()).toEqual(taggedFeedbackIds.sort())
  })
  test('by tag "bug" returns only the ones with "bug" as tag', async () => {
    const feedbackAtStart = await helper.feedbackInDb()
    const taggedSubmissionIds = feedbackAtStart.filter(f => f.tag === 'bug').map(f => f.id)
    const { body: { data: taggedFeedback } } = await api.get(`${FEEDBACK_ENDPOINT}?tag=bug`)
    const taggedFeedbackIds = taggedFeedback.map(f => f.id)
    expect(taggedSubmissionIds.sort()).toEqual(taggedFeedbackIds.sort())
  })
  test('by tag "enhancement" returns only the ones with "enhancement" as tag', async () => {
    const feedbackAtStart = await helper.feedbackInDb()
    const taggedSubmissionIds = feedbackAtStart.filter(f => f.tag === 'enhancement').map(f => f.id)
    const { body: { data: taggedFeedback } } = await api.get(`${FEEDBACK_ENDPOINT}?tag=enhancement`)
    const taggedFeedbackIds = taggedFeedback.map(f => f.id)
    expect(taggedSubmissionIds.sort()).toEqual(taggedFeedbackIds.sort())
  })
  test('by tag "ui" returns only the ones with "ui" as tag', async () => {
    const feedbackAtStart = await helper.feedbackInDb()
    const taggedSubmissionIds = feedbackAtStart.filter(f => f.tag === 'ui').map(f => f.id)
    const { body: { data: taggedFeedback } } = await api.get(`${FEEDBACK_ENDPOINT}?tag=ui`)
    const taggedFeedbackIds = taggedFeedback.map(f => f.id)
    expect(taggedSubmissionIds.sort()).toEqual(taggedFeedbackIds.sort())
  })
  test('by tag "ux" returns only the ones with "ux" as tag', async () => {
    const feedbackAtStart = await helper.feedbackInDb()
    const taggedSubmissionIds = feedbackAtStart.filter(f => f.tag === 'ux').map(f => f.id)
    const { body: { data: taggedFeedback } } = await api.get(`${FEEDBACK_ENDPOINT}?tag=ux`)
    const taggedFeedbackIds = taggedFeedback.map(f => f.id)
    expect(taggedSubmissionIds.sort()).toEqual(taggedFeedbackIds.sort())
  })
  test('by non existing tag returns none', async () => {
    const { body: { data: taggedFeedback } } = await api.get(`${FEEDBACK_ENDPOINT}?tag=nonexisting`)
    expect([]).toEqual(taggedFeedback)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
