const { Model, modelFields } = require('./model')
const { getFilters, getSortingParams } = require('../../../../utils')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../../../config')
const { welcomeEmail } = require('../../../../utils/mail/mail')
const { validateFields } = require('./joiValidation')

exports.all = async (req, res, next) => {
  const filters = getFilters(req.query)
  const sortingParams = getSortingParams(req.query, modelFields)
  const data = await Model.find(filters).sort(sortingParams)
  res.json({ data })
}

exports.profile = async (req, res, next) => {
  const { token: { id } } = req
  const user = await Model.findById({ _id: id })
    .populate('comments')
    .populate('submissions')
  if (!user) {
    const message = req.t('user_not_found')
    return res.status(404).send({ message })
  } else {
    res.json({ data: user })
  }
}

exports.read = async (req, res, next) => {
  const { params: { id } } = req
  const data = await Model.findById(id)
  if (!data) {
    const message = req.t('user_not_found')
    return res.status(404).json({ message })
  }
  res.json({ data })
}

exports.signup = async (req, res, next) => {
  const { body } = req
  const validationErrors = await validateFields(body)
  if (Object.keys(validationErrors).length) return res.status(400).json({ message: validationErrors })
  const saltRounds = 10
  const hash = await bcrypt.hash(body.password, saltRounds)
  const user = new Model({
    username: body.username,
    name: body.name,
    lastname: body.lastname,
    email: body.email,
    passwordHash: hash
  })
  const newUser = await user.save()
  if (process.env.NODE_ENV === 'production') {
    welcomeEmail(newUser.username, newUser.email)
  }
  const message = req.t('user_signup_success')
  res.status(201).json({ message, data: { username: newUser.username, name: newUser.name } })
}

exports.login = async (req, res, next) => {
  const { body } = req
  const user = await Model.findOne({ username: body.username })
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(body.password, user.passwordHash)
  const success = req.t('user_login_success')
  if (!(user && passwordCorrect)) {
    const failure = req.t('user_login_failure')
    return res.status(401).json({ message: failure })
  }
  const {
    username = '',
    name = '',
    lastname = '',
    thumbnail = '',
    _id: id
  } = user
  const dataForToken = { username, id }
  const token = jwt.sign(dataForToken, config.TOKEN_SECRET) //, { expiresIn: config.TOKEN_EXPIRATION }

  res.status(200).json({ message: success, data: { token, username, name, lastname, thumbnail } })
}

// TODO
exports.update = async (req, res, next) => {
  const { body, params: { id }, user } = req
  if (id === user._id.toString()) {
    const data = await Model.findByIdAndUpdate(id, body, { runValidators: true, new: true })
    const message = req.t('feedback_update_success')
    res.json({ message, data })
  } else {
    const message = req.t('not_allowed_user')
    res.status(401).json({ message })
  }
}

exports.delete = async (req, res, next) => {
  const { user, params: { id } } = req
  // TODO: the user itself  could delete its own account
  if (user.admin) {
    const data = await Model.findByIdAndDelete(id)
    const success = req.t('user_delete_success')
    return res.status(200).json({ message: success, data })
  }
  const message = req.t('not_allowed_user')
  res.status(401).json({ message })
}

exports.passwordReset = async (req, res, next) => {

}

exports.passwordRecovery = async (req, res, next) => {

}

exports.deleteTestUser = async (req, res, next) => {
  await Model.deleteMany({ username: /carlos/ })
  res.status(200).json({ message: 'Test user deleted successfully' })
}
