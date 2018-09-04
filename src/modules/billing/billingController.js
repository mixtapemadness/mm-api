/* eslint camelcase:0 */
'use strict'
var BillingRepository = require('./billingRepository')
var Utils = require('../../utils/Utils')
var Promise = require('bluebird')
const roles = require('../roles/roles').roles

class BillingController {
  constructor (billingRepository) {
    this.billingRepo = billingRepository
  }

  ping (req, res) {
    res.ok('ping billing controller')
  }

  /**
   * @apiVersion 1.0.0
   * @api {put} /api/v1/billing/charge Charge
   * @apiName Charge
   * @apiGroup Billing
   * @apiPermission Authorization
   * @apiDescription Agree terms and condition
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  async charge (req, res) {
    const { body, user } = req
    let stripeCustomerId = user.stripeCustomerId

    if (stripeCustomerId) {
      this.billingRepo.updateCustomer(stripeCustomerId, user.fullName, user.email, '', body)
    } else {
      const response = await this.billingRepo.createCustomer(user.fullName, user.email, '', body)
      stripeCustomerId = response.id

      user.stripeCustomerId = stripeCustomerId
      user.save()
    }

    let amount = body.amount

    this.billingRepo.charge(amount, stripeCustomerId)
    .then(data => {
      res.ok(data)
    })
    .catch(res.badRequest)
  }

}

module.exports = new BillingController(new BillingRepository())
