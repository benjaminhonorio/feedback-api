const Joi = require('joi')

const signupSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  name: Joi.string()
    .min(3)
    .max(30)
    .required(),
  lastname: Joi.string()
    .min(3)
    .max(30)
    .required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required(),
  password: Joi.string()
    .min(6)
    .max(30)
    .pattern(/^[a-zA-Z0-9]{6,30}$/)
    .required()
    .messages({
      'string.pattern.base': 'password should contain numbers and letters only and should be between 6-30 characters long'
    }),
  passwordConfirmation: Joi.any().equal(Joi.ref('password'))
    .label('confirmation password')
    .messages({ 'any.only': '{{#label}} does not match' })

})

const loginSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  password: Joi.string()
    .min(6)
    .max(30)
    .pattern(/^[a-zA-Z0-9]{6,30}$/)
    .required()
    .messages({
      'string.pattern.base': 'password should contain numbers and letters only and should be between 6-30 characters long'
    })
})

const createEditFeedbackSchema = Joi.object({
  title: Joi.string()
    .min(10)
    .max(75)
    .required(),
  tag: Joi.string()
    .valid('ui', 'ux', 'enhancement', 'bug', 'feature')
    .required(),
  description: Joi.string()
    .min(10)
    .max(125)
    .required(),
  status: Joi.string()
    .valid('', 'planned', 'in-progress', 'live')
})

const createCommentSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(250)
    .required()
})

const validateFields = async (schema, obj) => {
  const validation = await schema.validate(obj, { abortEarly: false })
  if (validation.error) {
    const errorDetails = validation.error.details
    const errorMessages = errorDetails.reduce((acc, err) => {
      acc[err.path] = err.message
      return acc
    }, {})
    return errorMessages
  }
  return {}
}

module.exports = { signupSchema, loginSchema, validateFields, createEditFeedbackSchema, createCommentSchema }
