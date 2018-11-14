'use strict'

const {
  isAuthenticated,
  // addOneToOneRelation,
  prepareCrudModel,
  attachToAll
  // attachOwner
  // chainToResolver,
  // promiseToPreResolver,
  // promiseToPostResolver
} = require('../core/graphql')

module.exports = ({ artistDetailsModel, artistDetailsRepository, TC }) => {
  const {
    schemaComposer
  } = TC
  const {
    queries: crudQueries,
    mutations: crudMutations,
    ModelTC: FeedbackTC
  } = prepareCrudModel({
    Model: artistDetailsModel
  })

  // register queries
  schemaComposer
    .rootQuery()
    .addFields({
      ...attachToAll(isAuthenticated)(crudQueries),
      ...crudQueries
    })
  // register mutations
  schemaComposer
    .rootMutation()
    .addFields({
      ...crudMutations
    })

  TC.Feedback = FeedbackTC
  return FeedbackTC
}
