const express = require('express')
const router = express.Router()
const feedbackRoutes = require('./feedback/routes')
const userRoutes = require('./users/routes')
const commentRoutes = require('./comment/routes')

router.use('/feedback', feedbackRoutes)
router.use('/users', userRoutes)
router.use('/comments', commentRoutes)

module.exports = router
