const i18next = require('i18next')
const Backend = require('i18next-fs-backend')
const middleware = require('i18next-http-middleware')

exports.internationalization = (config) => {
  i18next.use(Backend).use(middleware.LanguageDetector)
    .init({
      fallbackLng: config.fallbackLng,
      backend: {
        loadPath: config.localesPathname
      }
    })

  return middleware.handle(i18next)
}
