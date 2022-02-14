const mongoose = require('mongoose')
const logger = require('../utils/logger')

exports.connect = (dbURI, options) => {
  mongoose.connect(dbURI, { ...options })
  mongoose.connection.on('connected', () => {
    logger.info('Database connected')
  })

  mongoose.connection.on('close', () => {
    logger.info('Database disconnected')
  })

  mongoose.connection.on('error', (error) => {
    logger.error(`Error connecting to database: ${error}`)
  })

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      logger.info('Database disconnected on app termination')
      process.exit(0)
    })
  })
}
