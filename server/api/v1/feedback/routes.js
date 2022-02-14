const { tokenExtractor, userExtractor } = require('../../../middlewares')
const router = require('express').Router()
const controller = require('./controller')

router.route('/')
  .get(controller.all)
  .post(tokenExtractor, userExtractor, controller.create)

router.route('/:id')
  .get(controller.read)
  .put(tokenExtractor, userExtractor, controller.update)
  .delete(tokenExtractor, userExtractor, controller.delete)

router.route('/:id/upvote').put(tokenExtractor, controller.upvote)

module.exports = router
