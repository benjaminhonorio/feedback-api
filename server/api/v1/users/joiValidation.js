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

const validateFields = async (obj) => {
  const validation = await signupSchema.validate(obj, { abortEarly: false })
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

//  const good = { username: 'mina', name: 'mina', lastname: 'honorio', email: 'mina@example.com', password: 'mina1234', passwordConfirmation: 'mina1234' }
// const bad = { username: 'as', name: 'mxxa', lastname: '', email: 'minom', password: 'asd123', passwordConfirmation: 'mina1234' }

module.exports = { signupSchema, validateFields }
