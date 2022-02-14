const express = require('express')
require('express-async-errors')
const config = require('./config')
const { internationalization } = require('./internationalization')
const cors = require('cors')
const api = require('./api/v1')
const middlewares = require('./middlewares')

const database = require('./database')

database.connect(config.MONGODB_URI)

const app = express()

// Middlewares
app.use(internationalization(config.INTERNATIONALIZATION))
app.use(cors())
app.use(express.json())
app.use(middlewares.requestLogger)

// API
app.use('/api/v1/', api)

app.use(middlewares.unknownEndpoint)
app.use(middlewares.errorHandler)

module.exports = app
