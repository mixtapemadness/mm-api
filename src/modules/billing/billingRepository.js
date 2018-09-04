/* eslint handle-callback-err:0 */
'use strict'

var roles = require('../roles/roles').roles
var Utils = require('../../utils/Utils')
var Promise = require('bluebird')
var config = require('app/config')
var stripe = require('stripe')(config.stripeKey)

class BillingRepo {
  // constructor () {
  // }

  createCustomer (name, email, description, token) {
    const data = {
      email,
      description,
      metadata: {
        name
      }
    }
    if (token) { data.source = token.id }
    return stripe.customers.create(data)
    .then((response) => {
      return Promise.resolve(response)
    })
    .catch((err) => {
      return Promise.reject(err)
    })
  }

  updateCustomer (customerId, name, email, description, token) {
    const data = { }
    if (token) { data.source = token.id }
    if (name) {
      if (!data.metadata) { data.metadata = {} }
      data.metadata.name = name
    }
    if (description) { data.description = description }
    if (email) { data.email = email }

    return stripe.customers.update(customerId, data)
    .then((response) => {
      return Promise.resolve(response)
    })
    .catch((err) => {
      return Promise.reject(err)
    })
  }

  charge (amount, stripeCustomerId) {
    // Create a new customer and then a new charge for that customer:
    return stripe.charges.create({
      amount: amount,
      currency: 'usd',
      customer: stripeCustomerId
    }).then(charge => {
        // New charge created on a new customer
      return Promise.resolve(charge)
    }).catch(err => {
        // Deal with an error
      return Promise.reject(err)
    })
  }

}

module.exports = BillingRepo

