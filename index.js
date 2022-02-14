const app = require('./server')
const http = require('http')
const config = require('./server/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

server.listen((config.PORT), () => {
  logger.info(`Server running on port ${config.PORT}`)
})
