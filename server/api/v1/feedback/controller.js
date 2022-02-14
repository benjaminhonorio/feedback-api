const { getFilters, getSortingParams } = require('../../../../utils')
const { Model, modelFields, references: referenceNames } = require('./model')
const { Model: User } = require('../users/model')

const references = Object.getOwnPropertyNames(referenceNames)

exports.all = async (req, res, next) => {
  const filters = getFilters(req.query)
  const sortingParams = getSortingParams(req.query, modelFields)
  const data = await Model
    .find(filters)
    .sort(sortingParams)
    .populate(references.join(' '), { username: 1, name: 1 })
  res.json({ data })
}

exports.read = async (req, res, next) => {
  const { id } = req.params
  const data = await Model.findById(id).populate(references.join(' '), { username: 1, name: 1 })
  if (!data) {
    const message = req.t('feedback_not_found')
    return res.status(404).json({ message })
  }
  res.json({ data })
}

exports.create = async (req, res, next) => {
  const { body, user } = req
  const creator = await User.findById(user.id)
  const doc = new Model({ ...body, user: creator._id })
  const data = await doc.save()
  creator.submissions = creator.submissions.concat(data._id)
  await creator.save()
  const message = req.t('feedback_creation_success')
  res.status(201).json({ message, data })
}

exports.update = async (req, res, next) => {
  const { body, params: { id }, user } = req
  delete body.upvotes
  const data = await Model.findById(id)
  const ownerId = user._id.toString()
  const creatorId = data.user.toString()
  if (ownerId === creatorId || user.admin === true) {
    const data = await Model.findByIdAndUpdate(id, body, { runValidators: true, new: true })
    const message = req.t('feedback_update_success')
    res.json({ message, data })
  } else {
    const message = req.t('not_allowed_user')
    res.status(401).json({ message })
  }
}

exports.delete = async (req, res, next) => {
  const { params: { id }, user } = req
  const data = await Model.findById(id)
  const ownerId = user._id.toString()
  const creatorId = data.user.toString()
  if (ownerId === creatorId || user.admin === true) {
    const data = await Model.findByIdAndDelete(id)
    const creator = await User.findByIdAndUpdate(
      user.admin ? data.user : user._id,
      { $pull: { submissions: data._id } },
      { new: true })
    await creator.save()
    const message = req.t('feedback_deletion_success')
    res.json({ message, data })
  } else {
    const message = req.t('not_allowed_user')
    res.status(401).json({ message })
  }
}

exports.upvote = async (req, res, next) => {
  const { params: { id } } = req
  const increaseUpvotes = { $inc: { upvotes: 1 } }
  const data = await Model.findOneAndUpdate({ _id: id }, increaseUpvotes, { new: true })
  res.json({ data })
}
