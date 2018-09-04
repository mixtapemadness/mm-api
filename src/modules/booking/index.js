'use strict'

const getNotificationRepository = (db) => {
  var NotificationRepository = require('../notification/notificationRepository')
  return new NotificationRepository({db})
}

const getRepository = (db) => {
  var BookingRepository = require('./bookingRepository')
  var notificationRepository = getNotificationRepository(db)

  return new BookingRepository({ db, notificationRepository })
}

const getGraphql = ({ db, TC }) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')

  return require('./bookingGraphql')({
    BookingModel: db.BookingModel,
    bookingRepository: getRepository(db),
    isAuthenticated,
    TC,
    db
  })
}

const getCtrl = (db) => {
  var BookingController = require('./bookingController')
  return new BookingController({db, bookingRepository: getRepository(db)})
}

const getRouteV1 = (db) => {
  let RouteV1 = require('./bookingRoutes.v1')
  return RouteV1({ ctrl: getCtrl(db) })
}

module.exports = {
  getRepository: getRepository,
  getGraphql: getGraphql,
  getRouteV1,
  initModel: (db, mongoose) => {
    db.BookingModel = require('./bookingModel')(mongoose)
  }
}
