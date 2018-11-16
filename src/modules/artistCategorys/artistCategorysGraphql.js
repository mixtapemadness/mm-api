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

module.exports = ({ artistCategorysModel, artistCategorysRepository, TC }) => {
  const {
    schemaComposer
  } = TC
  const {
    queries: crudQueries,
    mutations: crudMutations,
    ModelTC: ArtistCategorysTC
  } = prepareCrudModel({
    Model: artistCategorysModel
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

  TC.ArtistCategorys = ArtistCategorysTC
  return ArtistCategorysTC
}
