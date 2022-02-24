const mongoose = require('mongoose')
const config = require('../../../config')

// To prevent returning all documents when filters are not part of the schema, instead return empty array
// https://mongoosejs.com/docs/guide.html#strictQuery
// mongoose.set('strictQuery', false)

const modelFields = {
  title: {
    type: String,
    required: true,
    maxLength: 75,
    minLength: 10,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxLength: 125,
    minLength: 10,
    trim: true
  },
  upvotes: {
    type: Number,
    default: 1,
    min: 0
  },
  status: {
    type: String,
    default: '',
    enum: config.STATUS_OPTIONS
  },
  hidden: {
    type: Boolean,
    default: false
  },
  tag: {
    type: String,
    required: true,
    enum: config.TAGS_OPTIONS
  }
  // commentsCount: {
  //   type: Number,
  //   default: 0,
  //   min: 0
  // }

}

const references = {
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}

const feedbackSchema = new mongoose.Schema({ ...modelFields, ...references }, { timestamps: true })

feedbackSchema.methods.toggleHide = function () {
  this.hidden = !this.hidden
  return this.save() // returns a thenable similar to a promise
}

feedbackSchema.methods.setStatus = function (status) {
  this.status = status
  return this.save()
}

// Custom toJSON method

feedbackSchema.set('toJSON', {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Model = mongoose.model('Feedback', feedbackSchema)

module.exports = { Model, modelFields, references }
