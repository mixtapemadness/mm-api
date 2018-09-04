var BillingCtrl = require('./billingController')
var isAuthenticated = require('../../policies/isAuthenticated')

module.exports = {
  '/api/v1/billing': {
    '/ping': {
      get: [BillingCtrl.ping.bind(BillingCtrl)]
    },
    '/charge': {
      post: [isAuthenticated, BillingCtrl.charge.bind(BillingCtrl)]
    }
  }
}
