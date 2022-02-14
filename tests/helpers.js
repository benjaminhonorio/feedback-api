const { Model: Feedback } = require('../server/api/v1/feedback/model')
const { Model: User } = require('../server/api/v1/users/model')

const initialFeedback = [
  {
    title: 'Ability to follow others',
    description: 'Stay updated on comments and solutions other people post',
    tag: 'feature'
  },
  {
    title: 'Preview images not loading',
    description: 'Challenge preview images are missing when you apply a filter',
    tag: 'bug'
  },
  {
    title: 'Add a dark theme option',
    description: 'It would help people with light sensitivities and who prefer dark mode',
    tag: 'feature'
  },
  {
    title: 'Add tags for solutions',
    description: 'Easier to search for solutions based on a specific stack',
    tag: 'enhancement'
  },
  {
    title: 'Q&A within the challende hubs',
    description: 'Challenge-specific Q&A would make for easy reference',
    tag: 'feature'
  },
  {
    title: 'Allow image/video upload',
    description: 'Images and screencasts can enhance comments on solutions',
    tag: 'enhancement'
  }
]

const nonExistingId = async () => {
  const feedback = new Feedback({
    title: 'Will remove this soon',
    description: 'nothing else to add',
    tag: 'bug'
  })
  await feedback.save()
  await feedback.remove()
  return feedback._id.toString()
}

const feedbackInDb = async () => {
  const feedback = await Feedback.find({})
  return feedback.map((feedback) => feedback.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialFeedback,
  nonExistingId,
  feedbackInDb,
  usersInDb
}
