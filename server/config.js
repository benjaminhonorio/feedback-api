require('dotenv').config()

module.exports = {
  MONGODB_URI: process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI,
  PORT: process.env.PORT || 3000,
  TAGS_OPTIONS: ['ui', 'ux', 'enhancement', 'bug', 'feature'],
  STATUS_OPTIONS: ['', 'planned', 'in-progress', 'live'],
  INTERNATIONALIZATION: {
    fallbackLng: 'en',
    localesPathname: './locales/{{lng}}/translation.json'
  },
  FILTER_OPTIONS: ['tag', 'admin', 'status'], // feedback and users
  SORT_OPTIONS: {
    sortBy: {
      fields: ['createdAt', 'updatedAt'],
      default: 'createdAt'
    },
    direction: {
      options: ['asc', 'desc'],
      default: 'desc'
    }
  },
  PAGINATION_OPTIONS: {
    limit: 10,
    skip: 0,
    page: 1
  },
  DEFAULT_USER_THUMBNAIL: process.env.DEFAULT_USER_THUMBNAIL,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION
}
