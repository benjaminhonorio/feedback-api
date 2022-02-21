const router = require('express').Router()
const controller = require('./controller')
// const { auth, owner } = require('../../../middlewares')

router.route('/')
  .get(controller.all) // only admin=true,
  .post(controller.signup)

if (process.env.NODE_ENV === 'test') {
  router.route('/deleteTestUser').delete(controller.deleteTestUser)
}

router.route('/login')
  .post(controller.login)

router.route('/:id')
  .get(controller.read) // I can get my submissions from here by populating them
  .put(controller.update) // auth,
  .delete(controller.delete) // auth,

router.route('/:id/password_reset').put(controller.passwordReset) // auth,
router.route('/:id/password_recovery').put(controller.passwordRecovery) // auth,

module.exports = router
