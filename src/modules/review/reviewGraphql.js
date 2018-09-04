'use strict'

const {
  isAuthenticated,
  addOneToOneRelation,
  prepareCrudModel,
  attachToAll,
  attachOwner
} = require('../core/graphql')

module.exports = ({ ReviewModel, TC }) => {
  const {
    schemaComposer,
    UserTC,
    BookingTC
  } = TC

  // generate crud queries and mutations for model
  // uses model.name to generate names
  const {
    queries: crudQueries,
    mutations: crudMutations,
    ModelTC: ReviewTC
  } = prepareCrudModel({
    Model: ReviewModel
  })

  // set all owner wrappers
  const queries = attachOwner(crudQueries)
  const mutations = attachOwner(crudMutations)

  queries.reviewManyByTalent = ReviewTC.getResolver('findMany').wrapResolve(next => rp => {
    if (!rp.args.filter) {
      rp.args.filter = {}
    }

    rp.args.filter.talentId = rp.context.user._id

    return next(rp)
  })

  queries.reviewMany = ReviewTC.getResolver('findMany').wrapResolve(next => rp => {
    if (!rp.args.filter) {
      rp.args.filter = {}
    }

    return next(rp)
  })

  queries.reviewCountByTalent = ReviewTC.getResolver('count').wrapResolve(next => rp => {
    if (!rp.args.filter) {
      rp.args.filter = {}
    }

    rp.args.filter.talentId = rp.context.user._id

    return next(rp)
  })

  mutations.reviewCreate = ReviewTC.getResolver('createOne').wrapResolve(next => async rp => {
    if (!rp.args.record.talentId) {
      var booking = await global.db.BookingModel.findOne({ _id: rp.args.record.bookingId })

      rp.args.record.talentId = booking.talentId
    }
    return next(rp)
  })

  // ad relations to model
  addOneToOneRelation({
    ModelTC: ReviewTC,
    RelationTC: UserTC,
    name: 'talent',
    relPropName: 'talentId'
  })
  addOneToOneRelation({
    ModelTC: ReviewTC,
    RelationTC: BookingTC,
    name: 'booking',
    relPropName: 'bookingId'
  })
  addOneToOneRelation({
    ModelTC: ReviewTC,
    RelationTC: UserTC,
    name: 'booker',
    relPropName: 'bookerId'
  })

  // register queries
  schemaComposer
    .rootQuery()
    .addFields({
      ...attachToAll(isAuthenticated)(queries)
    })
  // register mutations
  schemaComposer
    .rootMutation()
    .addFields({
      ...attachToAll(isAuthenticated)(mutations)
    })

  TC.ReviewTC = ReviewTC

  return ReviewTC
}
