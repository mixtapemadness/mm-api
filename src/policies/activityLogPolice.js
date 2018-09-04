// var User = require('../modules/user/userModel')
var jwtService = require('app/services/jwtService')
var Utils = require('app/utils/Utils')
var config = require('app/config')

module.exports = hasActivitLogToken

function hasActivitLogToken (req, res, next) {
  var token = Utils.extractToken(req)
  if (config.activityLogKey !== token) return res.unauthorized()
  // TODO: here in future need to check for tokens in dabatase
  next()
}
