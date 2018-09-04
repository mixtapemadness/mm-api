'use strict'

const axios = require('axios')
const config = require('app/config')

class PaypalAdaptiveService {
  constructor ({ mode = 'production' }) {
    this.mode = mode
  }

  async call ({ operationName, options }) {
    const opts = config.paypal[this.mode]

    const client = axios.create({
      baseURL: opts.url,
      timeout: 30000,
      headers: {
        'X-PAYPAL-SECURITY-USERID': opts.userId,
        'X-PAYPAL-SECURITY-PASSWORD': opts.password,
        'X-PAYPAL-SECURITY-SIGNATURE': opts.signature,
        'X-PAYPAL-APPLICATION-ID': opts.appId,
        'X-PAYPAL-REQUEST-DATA-FORMAT': opts.requestFormat,
        'X-PAYPAL-RESPONSE-DATA-FORMAT': opts.responseFormat
      }
    })
    return await client.post(operationName, options)
  }

  // Payments

  async pay ({
    receivers,
    returnUrl,
    cancelUrl,
    currencyCode = 'USD',
    actionType = 'PAY',
    preapprovalKey = null
  }) {
    const options = {
      actionType,
      currencyCode,
      receiverList: {
        receiver: receivers
      },
      returnUrl,
      cancelUrl,
      requestEnvelope: {
        errorLanguage: 'en_US',
        detailLevel: 'ReturnAll'
      }
    }
    if (preapprovalKey) {
      options.preapprovalKey = preapprovalKey
    }

    return await this.call({
      operationName: 'Pay',
      options
    })
  }

  async paymentDetails ({ payKey }) {
    return await this.call({
      operationName: 'PaymentDetails',
      options: {
        payKey,
        requestEnvelope: {
          errorLanguage: 'en_US',
          detailLevel: 'ReturnAll'
        }
      }
    })
  }

  async executePayment ({ payKey }) {
    return await this.call({
      operationName: 'ExecutePayment',
      options: {
        payKey,
        requestEnvelope: {
          errorLanguage: 'en_US',
          detailLevel: 'ReturnAll'
        }
      }
    })
  }

  getPaymentOptions () {

  }

  SetPaymentOptions () {

  }

  getPrePaymentDisclosure () {

  }

  // Preapprovals

  async preapproval ({
    startingDate,
    endingDate,
    maxAmountPerPayment,
    maxNumberOfPayments,
    maxTotalAmountOfAllPayments,
    returnUrl,
    cancelUrl,
    currencyCode = 'USD',
    senderEmail = null
  }) {
    const options = {
      startingDate,
      endingDate,
      maxAmountPerPayment,
      maxNumberOfPayments,
      maxTotalAmountOfAllPayments,
      returnUrl,
      cancelUrl,
      currencyCode,
      requestEnvelope: {
        errorLanguage: 'en_US',
        detailLevel: 'ReturnAll'
      }
    }
    if (senderEmail) {
      options.senderEmail = senderEmail
    }

    return await this.call({
      operationName: 'Preapproval',
      options
    })
  }

  async preapprovalDetails ({ preapprovalKey }) {
    return await this.call({
      operationName: 'PreapprovalDetails',
      options: {
        preapprovalKey,
        requestEnvelope: {
          errorLanguage: 'en_US',
          detailLevel: 'ReturnAll'
        }
      }
    })
  }

  async cancelPreapproval ({ preapprovalKey }) {
    return await this.call({
      operationName: 'CancelPreapproval',
      options: {
        preapprovalKey,
        requestEnvelope: {
          errorLanguage: 'en_US',
          detailLevel: 'ReturnAll'
        }
      }
    })
  }

  // Others...

  refund () {

  }

  convertCurrency () {

  }

  getFundingPlans () {

  }

  getShippingAddresses () {

  }
}

module.exports = PaypalAdaptiveService
