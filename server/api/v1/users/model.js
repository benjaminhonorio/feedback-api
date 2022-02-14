const mongoose = require('mongoose')
const config = require('../../../config')

const modelFields = {
  username: {
    type: String,
    required: true,
    min: 6,
    max: 30
  },
  name: {
    type: String,
    required: true,
    min: 6,
    max: 30
  },
  lastname: {
    type: String,
    required: true,
    min: 6,
    max: 30
  },
  // To keep it simple, later I can add this stuff
  // sex: {
  //   type: String,
  //   default: 'non-specified',
  //   enum: ['male', 'female', 'non-specified']
  // },
  // age: {
  //   type: Number,
  //   min: 18,
  //   required: true
  // },
  // country: {
  //   type: String,
  //   required: true
  // },
  // phone: {
  //   type: String
  // },
  email: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  online: {
    type: Boolean,
    default: false
  },
  thumbnail: {
    type: String,
    default: config.DEFAULT_USER_THUMBNAIL
  },
  passwordHash: {
    type: String
  },
  submissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback'
    }
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
}

const userSchema = new mongoose.Schema(modelFields, { timestamps: true })

userSchema.methods.toggleOnline = function () {
  this.online = !this.online
}

userSchema.set('toJSON', {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Model = mongoose.model('User', userSchema)

module.exports = { Model, modelFields }
