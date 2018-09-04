'use strict'

const moment = require('moment')
const config = require('app/config')
const jwtService = require('app/services/jwtService')
const PaypalAdaptiveService = require('app/services/paypal/paypalAdaptive')
const uniq = require('lodash/uniq')
const has = require('lodash/has')

const isProactiveExpress = booking => {
  const daysAfter = moment().add(5, 'days')
  const startDate = moment(booking.startDate)
  return daysAfter.isSameOrAfter(startDate)
}
const isExpress = booking => {
  const daysAfter = moment().add(7, 'days')
  const startDate = moment(booking.startDate)
  return daysAfter.isSameOrAfter(startDate)
}

class PaymentRepo {
  constructor ({ db, notificationRepository }) {
    this.notificationRepository = notificationRepository
    this.db = db
    this.mailService = require('../../services/sendgrid/sendgridSevice')
  }

  async calculateRemainingFee ({ bookingId, user }) {
    try {
      const booking = await this.db.BookingModel.findOne({ _id: bookingId })
      console.log('booking: ', booking)
      if (!booking) {
        throw new Error('booking not found')
      }

      const payments = await this.db.PaymentModel.find({
        bookingId: booking._id,
        status: 'COMPLETED'
      })

      let remainingFee = booking.fee
      if (Array.isArray(payments) && payments.length > 0) {
        const paid = payments.reduce((paid, payment) => payment.amount + paid, 0)
        remainingFee = booking.fee - paid
      }
      return remainingFee
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getPaymentDetails ({ _id, user }) {
    try {
      const payment = await this.db.PaymentModel.findOne({ _id })
      console.log('payment: ', payment)
      if (!payment) {
        throw new Error('payment not found')
      }

      const service = new PaypalAdaptiveService({ mode: 'sandbox' })
      const resp = await service.paymentDetails({ payKey: payment.payKey })
      console.log('resp: ', resp)
      if (resp.data.error) {
        console.log('resp error: ', resp.data.error)
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async checkPayment ({ paymentId }) {
    try {
      const payment = await this.db.PaymentModel.findOne({ _id: paymentId })
      console.log('payment: ', payment)
      if (!payment) {
        throw new Error('payment not found')
      }

      const service = new PaypalAdaptiveService({ mode: 'sandbox' })
      const resp = await service.paymentDetails({ payKey: payment.payKey })
      console.log('resp: ', resp)
      if (resp.data.error) {
        console.log('resp error: ', resp.data.error)
      }

      payment.status = 'COMPLETED'
      payment.paypalPaymentDetails = resp.data
      console.log('savedPayment: ', payment)
      return payment.save()
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async initPayment ({ bookingId, amount, user }) {
    try {
      console.log('amount: ', amount)
      if (amount <= 0) {
        throw new Error('Amount can not bee zero')
      }

      const booking = await this.db.BookingModel.findOne({ _id: bookingId })
      if (!booking) {
        throw new Error('Booking not found')
      }

      const Payments = await this.db.PaymentModel.find({ bookingId: bookingId }, 'amount')
      let sum = 0
      if (Payments) {
        sum = Payments.reduce((acc, p) => p.amount + acc, 0)
      }
      const remained = booking.fee - sum

      if (remained <= 0) {
        throw new Error('Fully paid')
      }

      if (amount > remained) {
        throw new Error('Amount exceeds fee')
      }

      const talent = await this.db.UserModel.findOne({ _id: booking.talentId })
      if (!talent) {
        throw new Error('Talent not found')
      }

      const deposit = Number(((booking.fee * talent.bookingInfo.depositRequired) / 100))
      if (booking.fee === remained) {
        if (isExpress(booking) && amount !== remained) {
          throw new Error('Express booking must be paid fully')
        }
        if (amount < deposit) {
          throw new Error('Amount must be equal or greater than required deposit')
        }
      } else {
        if (isProactiveExpress(booking) && amount !== remained) {
          throw new Error('Booking balance must be paid fully')
        }
      }

      const payment = new this.db.PaymentModel({
        bookingId: booking._id,
        senderId: user._id,
        receiverId: talent._id,
        status: 'PENDING',
        amount
      })
      const savedPayment = await payment.save()

      const token = jwtService(config.jwt).sign({
        paymentId: payment._id
      })
      const returnUrlBase = `${config.back_url}/api/v1/payments/transaction`
      const ipnUrl = `${config.back_url}/api/v1/payments/ipn`
      const service = new PaypalAdaptiveService({ mode: 'sandbox' })
      const talentAmount = amount / 100 * 80
      const resp = await service.pay({
        // actionType: 'PAY_PRIMARY',
        paymentId: savedPayment._id,
        preapprovalKey: (user.paypal && user.paypal.preapprovalKey)
          ? user.paypal.preapprovalKey
          : null,
        returnUrl: `${returnUrlBase}/${token}`,
        cancelUrl: `${returnUrlBase}/${token}`,
        ipnNotificationUrl: `${ipnUrl}/${token}`,
        receivers: [
          {
            amount: Number(amount).toFixed(2).toString(),
            email: config.paypal.sandbox.primaryReceiver.email,
            primary: true
          },
          {
            amount: Number(talentAmount).toFixed(2).toString(),
            email: has(talent, 'payoutMethods.paypal.email')
              ? talent.payoutMethods.paypal.email
              : talent.email
          }
        ]
      })
      console.log('============== resp: ================')
      console.log(JSON.stringify(resp.data))
      // TODO: tmp "fix", to be changed
      // if (resp.data.error) {
      //   throw new Error(resp.data.error)
      // }
      // if (has(resp.data, 'responseEnvelope.error')) {
      //   throw new Error(resp.data.responseEnvelope.error)
      // }

      // savedPayment.payKey = resp.data.payKey
      // savedPayment.status = 'CREATED'
      // savedPayment.status = resp.data.paymentExecStatus
      // savedPayment.paypalPaymentDetails = resp.data

      // TODO: needs refactoring
      // if (resp.data.paymentExecStatus === 'COMPLETED') {
      //   booking.status = 'booked'
      //   booking.save()
      // }
      booking.status = 'booked'
      await booking.save()
      // this.notificationRepository.registerNotification(
      //   talent._id, // to
      //   'Booking booked', // message text
      //   booking._id, // actionId
      //   'BookingBooked', // actionType
      //   'Booking', // modelName
      //   user // receiver
      // )

      // console.log('============== notification params: ================')
      // console.log(
      //   talent._id,
      //   'New Payment',
      //   payment._id,
      //   'NewPayment',
      //   'Payment',
      //   user
      // )
      // await this.notificationRepository.registerNotification(
      //   talent._id,
      //   'New Payment',
      //   payment._id,
      //   'NewPayment',
      //   'Payment',
      //   user
      // )

      return savedPayment.save()
    } catch (e) {
      return Promise.reject(e.message)
    }
  }

  async preapprove ({ user }) {
    try {
      const start = moment()
      const end = moment(start).add(360, 'days')
      const service = new PaypalAdaptiveService({ mode: 'sandbox' })
      const returnUrlBase = `${config.back_url}/api/v1/payments/preapproved`
      const token = jwtService(config.jwt).sign({
        userId: user._id
      })
      const resp = await service.preapproval({
        startingDate: start,
        endingDate: end,
        returnUrl: `${returnUrlBase}/${token}`,
        cancelUrl: `${returnUrlBase}/${token}`,
        currencyCode: 'USD',
        maxAmountPerPayment: '2000',
        maxNumberOfPayments: '100',
        maxTotalAmountOfAllPayments: '2000'
      })
      console.log('resp: ', resp.data)
      if (resp.data.error) {
        throw new Error(resp.data.error)
      }
      user.paypal.preapprovalKey = resp.data.preapprovalKey
      await user.save()
      return resp.data.preapprovalKey
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async preapproved ({ userId }) {
    try {
      const user = await this.db.UserModel.findOne({ _id: userId })
      console.log('user: ', user)
      const service = new PaypalAdaptiveService({ mode: 'sandbox' })
      const preapprRes = await service.preapprovalDetails({
        preapprovalKey: user.paypal.preapprovalKey
      })

      console.log('preapprovalDetails: ', preapprRes.data)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async emailOnCreate (booking, payment, user) {
    try {
      const receiver = await this.db.UserModel.findOne({ _id: payment.receiverId })

      const sum = await this.db.PaymentModel.aggregate([
          { $match: { receiverId: payment.receiverId, bookingId: booking._id } },
          { $group: { _id: null, amount: { $sum: '$amount' } } }
      ])

      if (booking.fee === sum[0].amount) {
        return await this.mailService.send({
          templateName: 'paymentBookingPaid',
          templateData: {
            sender: user,
            receiver,
            payment,
            booking
          },
          to: receiver.email,
          subject: 'Booking Fee Paid'
        })
      } else {
        return await this.mailService.send({
          templateName: 'paymentCreated',
          templateData: {
            sender: user,
            receiver,
            payment,
            booking,
            remaninig: booking.fee - sum[0].amount
          },
          to: receiver.email,
          subject: 'New Payment Received'
        })
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async notifyOnCreate (record, user, payload, old) {
    try {
      // await this.notificationRepository.registerNotification(
      //   payload.receiverId,
      //   'Booking accepted',
      //   payload.bookingId,
      //   'BookingAccepted',
      //   'Booking',
      //   user
      // )

      await this.notificationRepository.registerNotification(
        payload.receiverId,
        old.status === 'booked'
          ? 'New payment received'
          : 'Booking accepted and new payment received',
        payload._id,
        'NewPayment',
        'Payment',
        user
      )
    } catch (e) {
      return Promise.reject(e)
    }
  }

  findBooking (selector) {
    return this.db.BookingModel.findOne(selector)
  }

  async friendList (userId) {
    const friends = await this.db.InvitationModel.find({
      status: 'accepted',
      $or: [
        { creator: userId },
        { receiverId: userId }
      ]
    }, '_id creator receiverId')

    return uniq(friends.map(
      f => String(f.creator) === String(userId)
      ? f.receiverId : f.creator
    ))
  }

  async subscribe ({ subscriptionName, paymentMethodNonce, user }) {
    try {
      let subscription = null
      if (subscriptionName === 'free') {
        subscription = {
          name: 'free',
          title: 'Free Package $0/Yr',
          status: 'ACTIVE'
        }
      } else {
        subscription = {
          name: 'pro',
          title: 'Professional Package $199/Yr',
          status: 'PENDING'
        }
      }
      user.subscription = subscription
      await user.save()
      if (subscriptionName !== 'free') {
        const BraintreeService = require('app/services/braintree/braintreeService')
        const braintree = new BraintreeService()
        const customer = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          paymentMethodNonce
        }
        const result = await braintree.createCustomer(customer)
        console.log('result: ', result)
      }
      return subscriptionName
    } catch (e) {
      return Promise.reject()
    }
  }

  // old subscribe with paypal
  // async subscribe ({ subscriptionName, user }) {
  //   try {
  //     let subscription = null
  //     if (subscriptionName === 'free') {
  //       subscription = {
  //         name: 'free',
  //         title: 'Free Package $0/Yr',
  //         status: 'ACTIVE'
  //       }
  //     } else {
  //       subscription = {
  //         name: 'pro',
  //         title: 'Professional Package $199/Yr',
  //         status: 'PENDING'
  //       }
  //     }
  //     user.subscription = subscription
  //     await user.save()
  //     if (subscriptionName !== 'free') {
  //       const { clientId, secret } = config.paypal.rest.sandbox
  //       const paypal = require('paypal-rest-sdk')
  //       const env = new paypal.core.SandboxEnvironment(clientId, secret)
  //       const client = new paypal.core.PayPalHttpClient(env)
  //       const billingAgreements = paypal.v1.billingAgreements
  //       const request = new billingAgreements.AgreementCreateRequest()
  //       const requestBodyJson = {
  //         'name': 'Professional Package',
  //         'description': 'Professional package $199/Year',
  //         'start_date': moment().add(10, 'minutes'),
  //         'plan': {
  //           'id': 'P-8WM44761L6638804FNLY3DWQ'
  //         },
  //         'payer': {
  //           'payment_method': 'paypal'
  //         }
  //       }
  //       request.requestBody(requestBodyJson)
  //       const res = await client.execute(request)
  //       const ret = res.result.links.find(link => link.rel === 'approval_url')
  //       const tokenArr = ret.href.split('&')
  //       // console.log('tokenArr: ', tokenArr)
  //       const tokenArr2 = tokenArr[tokenArr.length - 1].split('=')
  //       // console.log('tokenArr2: ', tokenArr2)
  //       // console.log('res: ', JSON.stringify(res.result))
  //       user.subscription.token = tokenArr2[tokenArr2.length - 1]
  //       await user.save()
  //       // console.log('user.subscription: ', user.subscription)

  //       return ret.href
  //     }
  //     return subscriptionName
  //     // const accessTokenRequest = new paypal.core.AccessTokenRequest(env)
  //     // const { result } = await client.execute(accessTokenRequest)
  //     // const accessToken = new paypal.core.AccessToken(result)
  //     // console.log('accessToken: ', accessToken)
  //   } catch (e) {
  //     return Promise.reject(e)
  //   }
  // }

  async confirmSubscription ({ token }) {
    const updated = await this.db.UserModel.findOneAndUpdate(
      { 'subscription.token': token },
      { $set: { 'subscription.status': 'ACTIVE' } },
      { new: true }
    )
    return updated.subscription.status === 'ACTIVE'
  }
}

module.exports = PaymentRepo
