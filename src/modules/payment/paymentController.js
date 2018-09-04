'use strict'

const has = require('lodash/has')
const config = require('app/config')
const jwtService = require('app/services/jwtService')

class PaymentController {
  constructor ({ db, paymentRepository }) {
    this.db = db
    this.paymentRepository = paymentRepository
  }

  async transaction (req, res) {
    const { token } = req.params
    const decoded = jwtService(config.jwt).decode(token)
    if (!decoded || !has(decoded, 'payload.paymentId')) {
      res.notFound('Not found')
      return
    }
    await this.paymentRepository.checkPayment({ paymentId: decoded.payload.paymentId })
    res.redirect(`${config.front_url}/transaction/${decoded.payload.paymentId}`)
  }

  async preapprove (req, res) {
    const { token } = req.params
    const decoded = jwtService(config.jwt).decode(token)
    console.log('decoded: ', decoded)
    if (!decoded || !has(decoded, 'payload.userId')) {
      res.notFound('Not found')
      return
    }
    await this.paymentRepository.preapproved({ userId: decoded.payload.userId })
    res.redirect(`${config.front_url}/settings/payments/preapproved`)
  }

  async subscriptionConfirmed (req, res) {
    if (!req.query.token) {
      res.badRequest('Missing mandatory data')
      return
    }
    if (!await this.paymentRepository.confirmSubscription({ token: req.query.token })) {
      res.serverError('Something goes wrong')
      return
    }
    res.redirect(`${config.front_url}/wizard`)
  }

  async webhooks (req, res) {
    console.log(req.body)
    res.ok(req.body)
    return
  }

  async createCustomer (req, res) {
    const BraintreeService = require('app/services/braintree/braintreeService')
    const braintree = new BraintreeService()

    // const customer = await this.gateway.customer.create({
    //   firstName: 'Jen',
    //   lastName: 'Smith',
    //   company: 'Braintree',
    //   email: 'jen@example.com',
    //   phone: '312.555.1234',
    //   fax: '614.555.5678',
    //   website: 'www.example.com'
    // })
    const result = await braintree.createCustomer(customer)
    res.ok(result)
  }

  async updateCustomer (req, res) {
    const BraintreeService = require('app/services/braintree/braintreeService')
    const braintree = new BraintreeService()
    const result = await braintree.updateCustomer()
    res.ok(result)
  }
}

module.exports = PaymentController
