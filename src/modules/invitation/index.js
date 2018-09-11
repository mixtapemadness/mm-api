const getNotificationRepository = (db) => {
  var NotificationRepository = require('../notification/notificationRepository')
  return new NotificationRepository({ db })
}

const getInvitationRepository = (db) => {
  var InvitationRepository = require('./invitationRepository')
  var notificationRepository = getNotificationRepository(db)
  return new InvitationRepository({ db, notificationRepository })
}

const getGraphql = ({ db, TC }) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')

  return require('./invitationGraphql')({
    InvitationModel: db.InvitationModel,
    isAuthenticated,
    TC,
    InvitationRepository: getInvitationRepository(db)
  })
}

module.exports = {
  getGraphql,
  getInvitationRepository,
  getRouteV1: (db) => null,
  initModel: (db, mongoose) => {
    db.InvitationModel = require('./invitationModel')(mongoose)
  }
}

