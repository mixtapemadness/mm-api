const getNotificationRepository = (db) => {
  var NotificationRepository = require('../notification/notificationRepository')
  return new NotificationRepository({db})
}

const getRepository = (db) => {
  var ChatRepository = require('./chatRepository')
  var notificationRepository = getNotificationRepository(db)
  return new ChatRepository({db, notificationRepository})
}

const getCtrl = (db) => {
  var ChatController = require('./chatController')

  return new ChatController({
    db,
    chatRepository: getRepository(db)
  })
}

const getRouteV1 = (db) => {
  var isAuthenticated = require('../../policies/isAuthenticated')
  let RouteV1 = require('./chatRoute.v1')
  return RouteV1({ isAuthenticated, ctrl: getCtrl(db) })
}

const getGraphql = ({db, TC}) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')
  require('./chatGraphql')({
    ChatModel: db.ChatModel,
    MessageModel: db.MessageModel,
    isAuthenticated,
    TC,
    chatRepository: getRepository(db)
  })
}

module.exports = {
  getCtrl: getCtrl,
  getRepository: getRepository,
  getRouteV1: getRouteV1,
  getGraphql: getGraphql,
  getRoute: (db) => null,
  initModel: (db, mongoose) => {
    db.ChatModel = require('./chatModel')(mongoose)
    db.MessageModel = require('./messageModel')(mongoose)
  }
}
