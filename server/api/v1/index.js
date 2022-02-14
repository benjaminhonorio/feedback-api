const express = require('express')
const router = express.Router()
const feedbackRoutes = require('./feedback/routes')
const userRoutes = require('./users/routes')

router.use('/feedback', feedbackRoutes)
router.use('/users', userRoutes)

module.exports = router
