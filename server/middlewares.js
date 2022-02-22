
const logger = require('../utils/logger')
const config = require('./config')
const { Model: User } = require('./api/v1/users/model')
const jwt = require('jsonwebtoken')

exports.requestLogger = (req, res, next) => {
  logger.info('Method:', req.method)
  logger.info('Path:  ', req.path)
  logger.info('Query:  ', req.query)
  logger.info('Params:  ', req.params)
  logger.info('Token:', req.get('authorization'))
  logger.info('Body:  ', req.body)
  logger.info('-----------------------')
  next()
}
// TODO: internationalization
exports.unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

exports.errorHandler = (error, req, res, next) => {
  logger.error(error.message)
  let message
  if (error.name === 'CastError') {
    message = req.t('error_malformatted_id')
    return res.status(400).send({ error: message })
  } else if (error.name === 'ValidationError') {
    message = req.t('feedback_creation_success')
    return res.status(400).json({ error: `${message}. ${error.message}` })
  } else if (error.name === 'JsonWebTokenError') {
    message = req.t('invalid_token')
    return res.status(401).json({ error: message })
  } else if (error.name === 'TokenExpiredError') {
    message = req.t('expired_token')
    return res.status(401).json({ error: message })
  }

  next(error)
}

exports.tokenExtractor = async (req, res, next) => {
  let token = req.get('authorization')
  if (token && token.toLowerCase().startsWith('bearer ')) {
    token = token.substring(7)
  }
  const decodedToken = jwt.verify(token, config.TOKEN_SECRET)
  req.token = decodedToken
  // Move error to error handler
  if (!decodedToken.id) {
    const message = req.t('missing_or_invalid_token')
    return res.status(401).json({ error: message })
  }
  next()
}

exports.userExtractor = async (req, res, next) => {
  const { token: { id } } = req
  const user = await User.findById({ _id: id })
  if (!user) {
    const message = req.t('user_not_found')
    return res.status(404).send({ message })
  } else {
    req.user = user
  }
  next()
}

exports.checkIfUserIsAdmin = async (req, res, next) => {
  let token = req.get('authorization')
  if (token && token.toLowerCase().startsWith('bearer ')) {
    token = token.substring(7)
    const { id } = jwt.verify(token, config.TOKEN_SECRET)
    const user = await User.findById({ _id: id })
    if (user.admin) {
      req.userIsAdmin = true
      return next()
    }
  }
  req.userIsAdmin = false
  next()
}
