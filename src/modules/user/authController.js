'use strict'

var config = require('../../config')
var urljoin = require('url-join')

class AuthController {
  constructor ({ db, authRepository }) {
    this.db = db
    this.authRepository = authRepository
  }

  async activateAccount (req, res) {
    try {
      var { token } = req.params

      await this.authRepository.activateAccount({ token })

      var success = urljoin(config.front_url, 'activation/success')

      res.redirect(success)
    } catch (e) {
      var fail = urljoin(config.front_url, 'activation/fail')

      res.redirect(fail)
    }
  }
}

module.exports = AuthController
