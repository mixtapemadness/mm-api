// var User = require('../modules/user/userModel')
var jwtService = require('../services/jwtService')
var Utils = require('../utils/Utils')

const authMiddleware = ({ db }) => {
  return async (req, res, next) => {
    var token = Utils.extractToken(req)
    if (!token) return next()
    var payload
    try {
      payload = jwtService(req.app.settings.configuration.jwt).verify(token)
    } catch (ex) {
      return next()
    }

    try {
      const user = await db.UserModel.findById(payload.id)
      if (!user) return next()
      // check if account is active
      // Turned offf
      // if (!user.account.active) return res.notActiveUser()

      req.user = user
      next()
    } catch (err) {
      res.serverError(err)
    }
  }
}

module.exports = {
  authMiddleware
}
