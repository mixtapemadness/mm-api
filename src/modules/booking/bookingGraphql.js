'use strict'

const {
  isAuthenticated,
  addOneToOneRelation,
  prepareCrudModel,
  attachToAll,
  attachOwner,
  chainToResolver,
  promiseToPreResolver,
  promiseToPostResolver
} = require('../core/graphql')

module.exports = ({ BookingModel, bookingRepository, TC }) => {
  const {
    schemaComposer,
    UserTC
  } = TC

  // generate crud queries and mutations for model
  // uses model.name to generate names
  const {
    queries: crudQueries,
    mutations: crudMutations,
    ModelTC: BookingTC
  } = prepareCrudModel({
    Model: BookingModel
  })

  BookingTC.addFields({
    chatId: {
      type: BookingTC.getFieldType('_id'),
      resolve: async source => bookingRepository.getChatId({ _id: source._id })
    },
    feePaid: {
      type: 'Float',
      resolve: async source => bookingRepository.getFeePaid({ _id: source._id })
    },
    feeRemained: {
      type: 'Float',
      resolve: async source => bookingRepository.getFeeRemained({ _id: source._id })
    }
  })

  addOneToOneRelation({
    ModelTC: BookingTC,
    RelationTC: UserTC,
    name: 'talent',
    relPropName: 'talentId'
  })
  addOneToOneRelation({
    ModelTC: BookingTC,
    RelationTC: UserTC,
    name: 'booker',
    relPropName: 'bookerId'
  })

  // set all owner wrappers
  const queries = attachOwner(crudQueries)
  const mutations = attachOwner(crudMutations)

  BookingTC.addResolver({
    name: 'bookingManyByUsers',
    args: {
      status: [BookingTC.getFieldType('status')],
      users: [BookingTC.getFieldType('talentId')],
      fromDate: BookingTC.getFieldType('endDate')
    },
    type: [BookingTC],
    resolve: async ({ args, context }) => bookingRepository.getBookingsByUsers(args, context.user)
  })

  BookingTC.addResolver({
    name: 'changeStatus',
    args: {
      _id: BookingTC.getFieldType('_id'),
      status: 'String!'
    },
    type: BookingTC,
    resolve: ({ args, context: { user } }) =>
      bookingRepository.changeStatus({
        user,
        record: args
      })
  })

  queries.bookingManyByTalent = BookingTC.getResolver('findMany').wrapResolve(next => rp => {
    if (!rp.args.filter) {
      rp.args.filter = {}
    }

    rp.args.filter.talentId = rp.context.user._id

    return next(rp)
  })

  queries.bookingCountByTalent = BookingTC.getResolver('count').wrapResolve(next => rp => {
    if (!rp.args.filter) {
      rp.args.filter = {}
    }

    rp.args.filter.talentId = rp.context.user._id

    return next(rp)
  })

  mutations.chainedBookingCreate = chainToResolver([
    promiseToPreResolver([
      async rp => {
        await bookingRepository.ensureCreatePermissions({
          record: rp.args.record,
          user: rp.user
        })
      },
      async rp => {
        const { args: { record } } = rp

        try {
          const talent = await global.db.UserModel.findOne({ _id: record.talentId }, 'bookingInfo')
          rp.args.record.depositRequired = talent.bookingInfo.depositRequired || 30
        } catch (e) {
          return Promise.reject(e.message)
        }

        return rp
      }
    ]),
    mutations.bookingCreate,
    promiseToPostResolver([
      ({ user }, payload) => bookingRepository.initializeChat(payload, user),
      ({ user }, payload) => bookingRepository.emailOnCreate(payload, user),
      ({ user }, payload) => bookingRepository.notifyOnCreate(payload, user)
    ])
  ])

  mutations.chainedBookingUpdateById = chainToResolver([
    promiseToPreResolver([
      async rp => {
        await bookingRepository.ensureUpdatePermissions({
          record: rp.args.record,
          user: rp.user
        })
      },
      async rp => {
        rp.args.record.status = 'modified'
      }
      // async rp => {
      //   if (!rp.context) {
      //     rp.context = {}
      //   }

      //   rp.context.old = await BookingModel.findOne({ _id: rp.args.record._id })

      //   if (rp.args.record.status !== 'declined') {
      //     rp.args.record.modifier = rp.context.user._id
      //   }
      // }
    ]),
    mutations.bookingUpdateById,
    promiseToPostResolver([
      ({ user }, { record }) => bookingRepository.emailOnStatusChange(record, user),
      ({ user }, { record }) => bookingRepository.notifyOnStatusChange(record, user)
    ])
  ])

  mutations.chainedBookingChangeStatus = chainToResolver([
    promiseToPreResolver([
      async rp => {
        await bookingRepository.ensureChangeStatusPermissions({
          record: rp.args,
          user: rp.user
        })
      }
    ]),
    BookingTC.getResolver('changeStatus'),
    promiseToPostResolver([
      ({ user }, payload) => bookingRepository.emailOnStatusChange(payload, user),
      ({ user }, payload) => bookingRepository.notifyOnStatusChange(payload, user)
    ])
  ])

  // register queries
  schemaComposer
    .rootQuery()
    .addFields({
      ...attachToAll(isAuthenticated)(queries),
      bookingManyByUsers: BookingTC.getResolver('bookingManyByUsers'),
      ...attachToAll(isAuthenticated)({
        bookingManyByAll: BookingTC.getResolver('findMany').wrapResolve(next => rp => {
          if (!rp.args.filter) {
            rp.args.filter = {}
          }

          return next(rp)
        }),
        bookingCountByAll: BookingTC.getResolver('count').wrapResolve(next => rp => {
          if (!rp.args.filter) {
            rp.args.filter = {}
          }

          return next(rp)
        })
      })
    })
  // register mutations
  schemaComposer
    .rootMutation()
    .addFields({
      ...attachToAll(isAuthenticated)({
        bookingCreate: mutations.chainedBookingCreate,
        bookingUpdateById: mutations.chainedBookingUpdateById,
        bookingChangeStatus: mutations.chainedBookingChangeStatus
      })
    })

  TC.BookingTC = BookingTC

  return BookingTC
}
