// const mongoose = require('mongoose')
// const helper = require('./helpers')

// const supertest = require('supertest')
// const app = require('../server')
// const { Model: Feedback } = require('../server/api/v1/feedback/model')
// const { Model: User } = require('../server/api/v1/users/model')

// const api = supertest(app)
// const FEEDBACK_ENDPOINT = '/api/v1/feedback'
// const USERS_ENDPOINT = '/api/v1/users'

// beforeAll(async () => {
//   await Feedback.deleteMany({})
//   await User.deleteMany({})
// })

// // jest.setTimeout(10000) //in case I need more than the 5000 default time
// // https://github.com/visionmedia/supertest/issues/398

// const hook = (method = 'post') => (url, payload = {}, token = '') => {
//   return api[method](url)
//     .send(payload)
//     .set('Authorization', `Bearer ${token}`)
// }
// const request = {
//   post: hook('post'),
//   get: hook('get'),
//   put: hook('put'),
//   delete: hook('delete')
// }

// afterAll(() => {
//   mongoose.connection.close()
// })
