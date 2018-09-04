var jwt = require('jsonwebtoken')
var config

module.exports = function(configuration) {
  config = configuration

  return {
    sign: sign,
    decode: decode,
    verify: verify
  }
}

function sign (payload) {
  return jwt.sign(payload, config.secret, {
    algorithm: config.algorithm,
    issuer: config.issuer,
    audience: config.audience
  })
}

function decode (token) {
  return jwt.decode(token, { complete: true })
}

function verify (token) {
  return jwt.verify(token, config.secret, {
    issuer: config.issuer,
    audience: config.audience
  })
}
