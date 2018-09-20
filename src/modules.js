const debug = require('debug')('mixtape')
const { apolloUploadExpress } = require('apollo-upload-server')
var WPAPI = require('wpapi')

module.exports = (app) => {
  const wp = new WPAPI({ endpoint: 'http://www.mixtapemadness.com/blog/wp-json' })
  require('./utils/responses').forEach((response) => {
    app.use(response)
  })

  /**
   * catch error from myError or send badRequest
   */
  app.use((req, res, next) => {
    res['catchError'] = (error) => {
      if (error.status) res.statusCode = error.status || 400

      // let option = {}
      // reportDetailedError(error, req, res, option);

      if (!error.status) {
        return res.badRequest(error)
      }

      const response = {
        code: error.code,
        message: error.message,
        error: error.message
      }
      return res.status(error.status).json(response)
    }

    next()
  })

  const controllers = [
    'user',
    'comments',
    // 'helpers',
    // 'booking',
    // 'event',
    // 'notification',
    // 'chat',
    // 'file',
    // 'review',
    // 'invitation',
    // 'payment',
    'media',
    // 'user',
    'tag',
    'category',
    'post'
  ]

  const mongoose = require('./db')(app.get('configuration').database.connection, 'Main')
  global.db = { mongoose }

  const graphqlHTTP = require('express-graphql')
  const {
    schemaComposer,
    TypeComposer,
    InputTypeComposer,
    EnumTypeComposer
  } = require('graphql-compose')
  const TC = { schemaComposer, TypeComposer, InputTypeComposer, EnumTypeComposer }

  // loop through all folders in api/controllers
  const modulesRoot = './modules/'
  controllers.forEach((ctrl) => {
    const mod = require(modulesRoot + ctrl)
    mod.initModel(global.db, mongoose)
    mod.getGraphql({ db: global.db, TC, wp })
    app.map(mod.getRouteV1(global.db))
  })

  const graphqlSchema = schemaComposer.buildSchema()
  const graphqlAuth = require('./policies/graphqlAuth')

  app.use(
    '/graphql',
    graphqlAuth
      .authMiddleware({
        db: global.db
      }),
    apolloUploadExpress(app.get('configuration').upload),
    graphqlHTTP((req, res) => ({
      schema: graphqlSchema,
      graphiql: true,
      context: {
        user: req.user,
        headers: req.headers
      }
    })))

  app.get('/', (req, res) => {
    res.sendStatus(200)
  })

  // catch 404
  app.use((req, res) => {
    res.notFound()
  })

  // catch 5xx
  app.use((err, req, res, next) => {
    debug(err)
    const response = {
      name: 'serverError',
      code: 'E_INTERNAL_SERVER_ERROR',
      message: 'Something bad happened on the server',
      data: {
        message: err.message
      }
    }
    res.status(500).json(response)
  })

  var config = require('app/config')
  var socket = require('socket.io-client')(config.socket.server)
  global.socket = socket
  /**
   * Send notification to online user
   * @param {object} message which message you want sent
   * @param {string} userId maybe user id, which receive this notification
   */
  global.sendSocketNotificationToUser = function (message, userId) {
    if (global.socket) {
      socket.emit('notification', { userId, message })
    }
  }
  /**
   * Send message to online user
   * @param {object} message which message you want sent
   * @param {string} userId maybe user id, which receive this notification
   */
  global.sendSocketMessageToUser = function (toUserId, fromUserId, type, message) {
    if (global.socket) {
      socket.emit('chat', { toUserId, fromUserId, type, message })
    }
  }

  socket.on('connect', function () {
    console.log('connect to socket server')
  })
  socket.on('event', function (data) {
    console.log('event of socket server')
  })
  socket.on('disconnect', function () {
    console.log('disconnect socket server')
  })
}

