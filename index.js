const app = require('./server')
const http = require('http')
const config = require('./server/config')
const logger = require('./utils/logger')
const { Server } = require('socket.io')
const { Model: User } = require('./server/api/v1/users/model')
const { Model: Comment } = require('./server/api/v1/comment/model')
const { Model: Feedback } = require('./server/api/v1/feedback/model')
const jwt = require('jsonwebtoken')

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization']
  }
})

const jwtMiddleware = async (socket, next) => {
  const { token } = socket.handshake.auth
  if (token) {
    try {
      const decodedToken = jwt.verify(token, config.TOKEN_SECRET)
      socket.userId = decodedToken.id
      const user = await User.findById({ _id: decodedToken.id })
      if (user.admin) {
        socket.userIsAdmin = true
        return next()
      }
      socket.userIsAdmin = false
      next()
    } catch (error) {
      const message = `Error: ${error?.message}`
      logger.error(message)
    }
  } else {
    socket.userIsAdmin = false
    next()
  }
}

io.use(jwtMiddleware)

io.on('connection', (socket, next) => {
  logger.info('A user connected')
  socket.on('disconnect', () => {
    logger.info('A user disconnected')
  })

  socket.on('join-feedback-room', async ({ feedbackId }) => {
    socket.join(feedbackId)
    logger.info(`A user joined the feedback room ${feedbackId}`)
    const feedback = await Feedback.findById(feedbackId)
      .populate('user', { username: 1, name: 1 })
      .populate({ path: 'comments', populate: { path: 'user', select: 'username name lastname thumbnail' } })
    io.to(feedbackId).emit('receive-feedback', {
      feedback, user: socket.userIsAdmin
    })
  })

  socket.on('leave-feedback-room', ({ feedbackId }) => {
    socket.leave(feedbackId)
    logger.info(`A user left the feedback room ${feedbackId}`)
  })

  socket.on('new-comment', async ({ feedbackId, user, content }) => {
    const commenter = await User.findById(socket.userId)
    const feedback = await Feedback.findById(feedbackId)
    const newComment = new Comment({ content, user: commenter._id, feedback: feedback._id })
    const data = await newComment.save()
    feedback.comments = feedback.comments.concat(data._id)
    commenter.comments = commenter.comments.concat(data._id)
    await commenter.save()
    await feedback.save()
    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate({ path: 'comments', populate: { path: 'user', select: 'username name lastname thumbnail' } })
    io.to(feedbackId).emit('receive-comment', {
      comments: updatedFeedback.comments
    })
  })

  socket.on('delete-comment', async ({ commentId }) => {
    const comment = await Comment.findByIdAndDelete(commentId)
    const feedback = await Feedback.findByIdAndUpdate(comment.feedback,
      { $pull: { comments: comment._id } },
      { new: true })
    const creator = await User.findByIdAndUpdate(comment.user,
      { $pull: { comments: comment._id } },
      { new: true })
    await feedback.save()
    await creator.save()
    const comments = await Comment.find({ feedback: comment.feedback })
      .populate('user', 'username name lastname thumbnail')
    io.to(comment.feedback.toString()).emit('update-comments', {
      comments
    })
  })

  socket.on('upvote', async ({ feedbackId }) => {
    const increaseUpvotes = { $inc: { upvotes: 1 } }
    const data = await Feedback.findByIdAndUpdate({ _id: feedbackId }, increaseUpvotes, { new: true })
    io.to(feedbackId).emit('update-feedback-upvotes', data.upvotes)
  })
})

server.listen((config.PORT), () => {
  logger.info(`Server running on port ${config.PORT}`)
})
