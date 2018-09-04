const braintree = require('braintree')
const config = require('app/config')

class BraintreeService {
  constructor ({ sandbox = true }) {
    const conf = sandbox
      ? config.braintree.sandbox
      : config.braintree.production

    this.gateway = braintree.connect({
      environment: sandbox
        ? braintree.Environment.Sandbox
        : braintree.Environment.Production,
      merchantId: conf.merchantId,
      publicKey: conf.publicKey,
      privateKey: conf.privateKey
    })
  }

  async createCustomer (data) {
    try {
      return await this.gateway.customer.create(data)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async updateCustomer (customerId, data) {
    try {
      return await this.gateway.customer.update(customerId, data)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async deleteCustomer (customerId) {
    try {
      return await this.gateway.customer.delete(customerId)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async findCustomer (customerId) {
    try {
      return await this.gateway.customer.find(customerId)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async createPaymentMethod (customerId, paymentMethodNonce) {
    try {
      return await this.gateway.paymentMethod.create({ customerId, paymentMethodNonce })
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async deletePaymentMethod (paymentMethodToken) {
    try {
      return await this.gateway.paymentMethod.delete(paymentMethodToken)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async createTransaction (data) {
    try {
      return await this.gateway.transaction.sale(data)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async settleTransaction (transactionId) {
    try {
      return await this.gateway.transaction.submitForSettlement(transactionId)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async refundTransaction (transactionId) {
    try {
      return await this.gateway.transaction.refund(transactionId)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async createSubscription (planId, paymentMethodToken) {
    try {
      return await this.gateway.subscription.create({ paymentMethodToken, planId })
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async updateSubscription (subscriptionId, data) {
    try {
      return await this.gateway.subscription.update(subscriptionId, data)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async cancelSubscription (subscriptionId) {
    try {
      return await this.gateway.subscription.cancel(subscriptionId)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async generateClientToken (customerId) {
    try {
      const response = await this.gateway.clientToken.generate({ customerId })
      return response.clientToken
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

module.exports = BraintreeService
