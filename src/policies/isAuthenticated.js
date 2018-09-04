const jwtService = require('../services/jwtService')
const Utils = require('../utils/Utils')

module.exports = isAuthenticated

function isAuthenticated (req, res, next) {
  const token = Utils.extractToken(req)
  if (!token) {
    return res.unauthorized()
  }

  let payload
  try {
    payload = jwtService(req.app.settings.configuration.jwt).verify(token)
  } catch (ex) {
    if (ex.name === 'TokenExpiredError') {
      return res.tokenExpired()
    } else {
      return res.unauthorized()
    }
  }

  global.db.UserModel.findById(payload.id).populate('company')
    .exec().then((user) => {
      if (!user) return res.unauthorized()

      // check if account is active
      // Turned offf
      // if (!user.account.active) return res.notActiveUser()

      req.user = user

      next()
    }).catch((err) => {
      res.serverError(err)
    })
}
