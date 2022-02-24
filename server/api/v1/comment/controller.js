// Most of the controllers are not been used because I'm using sockets with similar controllers
// Maybe I can reuse later
const { Model } = require('./model')
const { Model: User } = require('../users/model')
const { Model: Feedback } = require('../feedback/model')

exports.all = async (req, res, next) => {
  const data = await Model
    .find({})
    .sort('-createdAt')
    .populate('user', { username: 1, name: 1, lastname: 1, thumbnail: 1 })
  res.json({ data })
}

exports.create = async (req, res, next) => {
  const { body, user, params } = req
  const { feedbackId } = params
  const commenter = await User.findById(user.id)
  const feedback = await Feedback.findById(feedbackId)
  const doc = new Model({ ...body, user: commenter._id, feedback: feedback._id })
  const data = await doc.save()
  feedback.comments = feedback.comments.concat(data._id)
  commenter.comments = commenter.comments.concat(data._id)
  await commenter.save()
  await feedback.save()
  const message = req.t('comment_creation_success')
  res.status(201).json({ message, data })
}

exports.delete = async (req, res, next) => {
  const { params: { id }, user } = req
  const data = await Model.findById(id)
  const ownerId = user._id.toString()
  const commenterId = data.user.toString()
  if (ownerId === commenterId || user.admin === true) {
    const data = await Model.findByIdAndDelete(id)
    const commenter = await User.findByIdAndUpdate(
      user.admin ? data.user : user._id,
      { $pull: { comments: data._id } },
      { new: true })
    const feedback = await Feedback.findByIdAndUpdate(
      data.feedback,
      { $pull: { comments: data._id } },
      { new: true })
    await commenter.save()
    await feedback.save()
    const message = req.t('comment_deletion_success')
    res.json({ message, data })
  } else {
    const message = req.t('not_allowed_user')
    res.status(401).json({ message })
  }
}
