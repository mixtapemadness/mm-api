'use strict'
var Promise = require('bluebird')
var config = require('app/config')
var stripe = require('stripe')(config.stripeApiKey)

class StripeService {
  constructor () {
  }

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

  createSubscription (customerId, stripePlanId, quantity = 0, trial_end) {
    const data = {
      customer: customerId,
      billing: 'charge_automatically',
      items: [{
        plan: stripePlanId,
        quantity
      }]
    }
    if (trial_end) { data.trial_end = trial_end }
    return stripe.subscriptions.create(data)
    .then((response) => {
      return Promise.resolve(response)
    })
    .catch((err) => {
      return Promise.reject(err)
    })
  }

  retrieveSubscription (subcriptionId) {
    return stripe.subscriptions.retrieve(subcriptionId)
    .then((response) => {
      return Promise.resolve(response)
    })
    .catch((err) => {
      return Promise.reject(err)
    })
  }

  updateSubscription (subscriptionId, items, trial_end) {
    const data = {
      items,
      trial_end
    }
    return stripe.subscriptions.update(subscriptionId, data)
    .then((response) => {
      return Promise.resolve(response)
    })
    .catch((err) => {
      return Promise.reject(err)
    })
  }

  updateSubscriptionItem (subId, itemId, stripePlanId, quantity) {
    return stripe.subscriptions.update(subId, {
      items: [{
        id: itemId,
        plan: stripePlanId,
        quantity
      }]
    })
    .then((response) => {
      return Promise.resolve(response)
    })
    .catch((err) => {
      return Promise.reject(err)
    })
  }

  eventsList (limit = 10, starting_after, types) {
    const query = { limit }
    if (starting_after) {
      query.starting_after = starting_after
    }
    if (types) {
      query.types = types
    }
    return stripe.events.list(query)
    .then((response) => {
      return Promise.resolve(response)
    })
    .catch((err) => {
      return Promise.reject(err)
    })
  }

  invoices (customer, limit = 10, date, starting_after, subscription) {
    const query = { limit }
    if (customer) {
      query.customer = customer
    }
    if (date) {
      query.date = date
    }
    if (starting_after) {
      query.starting_after = starting_after
    }
    if (subscription) {
      query.subscription = subscription
    }
    return stripe.invoices.list(query)
    .then((response) => {
      return Promise.resolve(response.data)
    })
    .catch((err) => {
      return Promise.reject(err)
    })
  }

  upcomingInvoice (customer) {
    return stripe.invoices.retrieveUpcoming(customer)
    .then((response) => {
      return Promise.resolve(response)
    })
    .catch((err) => {
      return Promise.reject(err)
    })
  }

  payInvoice (invoiceId) {
    return stripe.invoices.pay(invoiceId)
    .then((response) => {
      return Promise.resolve(response)
    })
    .catch((err) => {
      return Promise.reject(err)
    })
  }

  parseInvoices (invoices, customer) {
    const list = []
    if (!invoices) {
      return list
    }
    invoices.map(invoice => {
      list.push(this.parseInvoice(invoice, customer))
    })
    return list
  }

  parseInvoice (invoice, customer) {
    if (!invoice) { return {} }
    const details = invoice.lines.data.map(i => {
      return {
        id: i.id,
        description: i.description,
        total: (i.amount / 100),
        price: (i.amount / 100 / i.quantity),
        quantity: i.quantity,
        plan: i.plan.name,
        periodEnd: new Date(i.period.end * 1000),
        periodStart: new Date(i.period.start * 1000),
        billing: (i.billing === 'charge_automatically') ? 'Charge Automatically' : ''
      }
    })
    const result = {
      number: invoice.number,
      currency: invoice.currency,
      date: new Date(invoice.date * 1000),
      total: invoice.total / 100,
      details,
      periodEnd: (invoice.period_end * 1000),
      periodStart: (invoice.period_start * 1000),
      status: invoice.paid ? 'Paid' : 'Unpaid',
      closed: invoice.closed ? 'Closed' : 'Unclosed',
      customerName: customer ? customer.metadata.name : '',
      customerEmail: customer ? customer.email : ''
    }
    return result
  }

  getMethods (stripeCustomerId) {
    return new Promise((resolve, reject) => {
      if (!stripeCustomerId) {
        resolve([])
      } else {
        stripe
        .customers
        .retrieve(stripeCustomerId)
        .then((customer) => {
          resolve(customer.sources.data)
        })
        .catch((err) => {
          console.log(err)
        })
      }
    })
  }

  pay (totalStripe, stripeCustomerId) {
    return stripe.charges.create({
      amount: totalStripe,
      currency: 'usd',
      customer: stripeCustomerId
    }).then((result) => {
      console.log(result)
      return Promise.resolve(result)
    })
  }
}

module.exports = StripeService

