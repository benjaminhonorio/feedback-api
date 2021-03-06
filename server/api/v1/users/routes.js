const router = require('express').Router()
const { tokenExtractor, userExtractor } = require('../../../middlewares')
const controller = require('./controller')

router.route('/')
  .get(controller.all) // only admin=true, to be implemented
  .post(controller.signup)

if (process.env.NODE_ENV === 'test') {
  router.route('/deleteTestUser').delete(controller.deleteTestUser)
}

router.route('/profile')
  .get(tokenExtractor, controller.profile)

router.route('/login')
  .post(controller.login)

router.route('/:id')
  .get(tokenExtractor, controller.read) // I can get my submissions from here by populating them
  .put(tokenExtractor, userExtractor, controller.update) // auth,
  .delete(tokenExtractor, userExtractor, controller.delete) // auth,

// router.route('/:id/password_reset').put(controller.passwordReset) // auth,
// router.route('/:id/password_recovery').put(controller.passwordRecovery) // auth,

module.exports = router
