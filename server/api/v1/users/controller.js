const { Model, modelFields } = require('./model')
const { getFilters, getSortingParams } = require('../../../../utils')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../../../config')

exports.all = async (req, res, next) => {
  const filters = getFilters(req.query)
  const sortingParams = getSortingParams(req.query, modelFields)
  const data = await Model.find(filters).sort(sortingParams)
  res.json({ data })
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
  const dataForToken = {
    username: user.username,
    id: user._id
  }
  const token = jwt.sign(dataForToken, config.TOKEN_SECRET) //, { expiresIn: config.TOKEN_EXPIRATION }

  res.status(200).json({ message: success, token, username: user.username, name: user.name })
}

// TODO
exports.update = async (req, res, next) => {

}

exports.delete = async (req, res, next) => {

}

exports.passwordReset = async (req, res, next) => {

}

exports.passwordRecovery = async (req, res, next) => {

}
