const { tokenExtractor, userExtractor, checkIfUserIsAdmin } = require('../../../middlewares')
const router = require('express').Router()
const controller = require('./controller')
const commentRoutes = require('../comment/routes')

router.route('/')
  .get(controller.all)
  .post(tokenExtractor, userExtractor, controller.create)

router.route('/:id')
  .get(checkIfUserIsAdmin, controller.read)
  .put(tokenExtractor, userExtractor, controller.update)
  .delete(tokenExtractor, userExtractor, controller.delete)

router.route('/:id/upvote').put(controller.upvote) // removed tokenExtractor since it wasnt been used

router.use('/:feedbackId/comments', commentRoutes)

module.exports = router
