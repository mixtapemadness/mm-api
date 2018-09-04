'use strict'

const { composeWithMongoose } = require('graphql-compose-mongoose/node8')
const {
  isAuthenticated,
  attachToAll,
  addOneToOneRelation,
  chainToResolver,
  promiseToPostResolver,
  promiseToPreResolver
} = require('../core/graphql')
const omit = require('lodash/omit')

module.exports = ({
  PaymentModel,
  TC,
  paymentRepository
}) => {
  const { schemaComposer, BookingTC, UserTC } = TC

  const PaymentTC = composeWithMongoose(PaymentModel, {})

  PaymentTC.removeField(['__v'])

  addOneToOneRelation({
    ModelTC: PaymentTC,
    RelationTC: BookingTC,
    name: 'booking',
    relPropName: 'bookingId'
  })
  addOneToOneRelation({
    ModelTC: PaymentTC,
    RelationTC: UserTC,
    name: 'sender',
    relPropName: 'senderId'
  })
  addOneToOneRelation({
    ModelTC: PaymentTC,
    RelationTC: UserTC,
    name: 'receiver',
    relPropName: 'receiverId'
  })

  PaymentTC.addResolver({
    name: 'getRemainingFee',
    args: {
      bookingId: BookingTC.getFieldType('_id')
    },
    type: 'Float',
    resolve: async ({ args: { bookingId }, context: { user } }) => {
      return paymentRepository.calculateRemainingFee({ bookingId, user })
    }
  })

  PaymentTC.addResolver({
    name: 'getPaymentDetails',
    args: {
      _id: PaymentTC.getFieldType('_id')
    },
    type: PaymentTC,
    resolve: async ({ args: { _id }, context: { user } }) => {
      return paymentRepository.getPaymentDetails({ _id, user })
    }
  })

  PaymentTC.addResolver({
    name: 'preapprove',
    type: 'String',
    resolve: async ({ context: { user } }) => {
      return paymentRepository.preapprove({ user })
    }
  })

  PaymentTC.addResolver({
    name: 'initPay',
    args: {
      bookingId: BookingTC.getFieldType('_id'),
      amount: { type: 'Float' }
    },
    type: PaymentTC,
    resolve: async ({ args: { bookingId, amount }, context: { user } }) => {
      return paymentRepository.initPayment({ bookingId, amount, user })
    }
  })

  const chainedInitPay = chainToResolver([
    promiseToPreResolver([
      async rp => {
        if (!rp.context) {
          rp.context = {}
        }

        rp.context.old = await paymentRepository.findBooking({ _id: rp.args.bookingId })
      }
    ], [
      'args',
      'context'
    ]),
    PaymentTC.getResolver('initPay'),
    promiseToPostResolver([
      ({ args: { record }, context: { user, old } }, payload) =>
        paymentRepository.notifyOnCreate(record, user, payload, old),
      // TODO: needs fix, there are no record in emailOnCreate but payload !!!!!!
      ({ context: { user, old } }, payload) =>
        paymentRepository.emailOnCreate(old, payload, user)
    ], [
      'args',
      'context'
    ])
  ])

  const getPayments = PaymentTC.getResolver('findMany').wrapResolve(next => async rp => {
    if (!rp.args.filter) {
      rp.args.filter = {}
    }

    switch (rp.context.user.role) {
      case 'talent':
        rp.args.filter.OR = [
          { senderId: rp.context.user._id },
          { receiverId: rp.context.user._id }
        ]
        break
      case 'booker':
        rp.args.filter.senderId = rp.context.user._id
        break
      case 'bookingAgent':
        const friends = await paymentRepository.friendList(rp.context.user._id)

        const { _operators } = rp.args.filter
        const filters = omit(rp.args.filter, ['_operators'])

        rp.args.filter = {
          _operators,
          AND: [
            Object.assign({}, filters, { _id: { $exists: true } }),
            { receiverId: { $in: friends } }
          ]
        }

        break
    }

    return next(rp)
  })

  PaymentTC.addResolver({
    name: 'subscribe',
    args: {
      subscriptionName: 'String!',
      paymentMethodNonce: 'String'
    },
    type: 'String',
    resolve: async ({ args: { subscriptionName }, context: { user } }) => {
      return paymentRepository.subscribe({ subscriptionName, user })
    }
  })

  schemaComposer
    .rootQuery()
    .addFields({
      ...attachToAll(isAuthenticated)({
        getRemainingFee: PaymentTC.getResolver('getRemainingFee'),
        getPaymentDetails: PaymentTC.getResolver('getPaymentDetails'),
        getPayments
      })
    })
  schemaComposer
    .rootMutation()
    .addFields({
      ...attachToAll(isAuthenticated)({
        initPay: chainedInitPay,
        preapprove: PaymentTC.getResolver('preapprove'),
        subscribe: PaymentTC.getResolver('subscribe')
      })
    })

  TC.PaymentTC = PaymentTC

  return PaymentTC
}
