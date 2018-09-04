
const getRepository = (db) => {
  var NotificationRepository = require('./notificationRepository')
  return new NotificationRepository({db})
}

const getCtrl = (db) => {
  var NotificationController = require('./notificationController')
  return new NotificationController({db, notificationRepository: getRepository(db)})
}

const getRouteV1 = (db) => {
  var isAuthenticated = require('../../policies/isAuthenticated')
  let RouteV1 = require('./notificationRoutes.v1')
  return RouteV1({isAuthenticated, ctrl: getCtrl(db)})
}

const getGraphql = ({db, TC}) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')
  require('./notificationGraphql')({
    NotificationModel: db.NotificationModel,
    isAuthenticated,
    TC
  })
}

module.exports = {
  getCtrl,
  getRepository,
  getRouteV1,
  getGraphql,
  getRoute: (db) => null,
  initModel: (db, mongoose) => {
    db.NotificationModel = require('./notificationModel')(mongoose)
  }
}
