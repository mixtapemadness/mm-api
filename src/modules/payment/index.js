'use strict'

const getNotificationRepository = (db) => {
  var NotificationRepository = require('../notification/notificationRepository')
  return new NotificationRepository({db})
}

const getRepository = (db) => {
  var PaymentRepository = require('./paymentRepository')
  var notificationRepository = getNotificationRepository(db)
  return new PaymentRepository({db, notificationRepository})
}

const getCtrl = (db) => {
  var PaymentController = require('./paymentController')
  return new PaymentController({db, paymentRepository: getRepository(db)})
}

const getRouteV1 = (db) => {
  var isAuthenticated = require('../../policies/isAuthenticated')
  let RouteV1 = require('./paymentRoutes.v1')
  return RouteV1({isAuthenticated, ctrl: getCtrl(db)})
}

const getGraphql = ({db, TC}) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')

  return require('./paymentGraphql')({
    PaymentModel: db.PaymentModel,
    isAuthenticated,
    paymentRepository: getRepository(db),
    TC
  })
}

module.exports = {
  getRepository: getRepository,
  getGraphql: getGraphql, // TODO: NOTE: temp returns null
  getRouteV1,
  initModel: (db, mongoose) => {
    db.PaymentModel = require('./paymentModel')(mongoose)
  }
}
