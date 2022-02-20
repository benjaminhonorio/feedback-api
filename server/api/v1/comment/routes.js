const { tokenExtractor, userExtractor } = require('../../../middlewares')
const router = require('express').Router({
  mergeParams: true
})
const controller = require('./controller')

router.route('/')
  .get(controller.all)
  .post(tokenExtractor, userExtractor, controller.create)

router.route('/:id')
  .delete(tokenExtractor, userExtractor, controller.delete)

module.exports = router
