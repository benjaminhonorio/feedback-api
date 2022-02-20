const mongoose = require('mongoose')

const modelFields = {
  content: {
    type: String,
    required: true,
    maxLength: 250,
    trim: true
  }
}

const references = {
  feedback: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}

const CommentSchema = new mongoose.Schema({ ...modelFields, ...references }, { timestamps: true })

// Custom toJSON method
CommentSchema.set('toJSON', {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Model = mongoose.model('Comment', CommentSchema)

module.exports = { Model, modelFields, references }
