'use strict'

const omit = require('lodash/omit')

const {
  isAuthenticated,
  prepareCrudModel,
  attachToAll,
  attachOwner,
  addOneToOneRelation,
  chainToResolver,
  promiseToPostResolver,
  promiseToPreResolver
} = require('../core/graphql')

module.exports = ({ InvitationModel, TC, InvitationRepository }) => {
  const { schemaComposer, UserTC } = TC

  const { queries: crudQueries, mutations: crudMutations, ModelTC: InvitationTC } = prepareCrudModel({
    Model: InvitationModel
  })

  const queries = attachOwner(crudQueries)
  const mutations = attachOwner(crudMutations)

  InvitationTC.removeField(['__v'])

  queries.invitationManyByReceiver = InvitationTC
    .getResolver('findMany')
    .wrapResolve(next => rp => {
      if (!rp.args.filter) {
        rp.args.filter = {}
      }

      rp.args.filter = omit(rp.args.filter, ['creator'])
      rp.args.filter.receiverId = rp.context.user._id

      return next(rp)
    })

  addOneToOneRelation({
    ModelTC: InvitationTC,
    RelationTC: UserTC,
    name: 'receiver',
    relPropName: 'receiverId'
  })

  addOneToOneRelation({
    ModelTC: InvitationTC,
    RelationTC: UserTC,
    name: 'sender',
    relPropName: 'creator'
  })

  mutations.invitationCreate = chainToResolver([
    promiseToPreResolver([
      async ({ args: { record }, user }) => {
        const isBlocked = await global.db.UserModel.count({
          _id: record.receiverId,
          blockedUsers: user._id
        })

        if (isBlocked) {
          return Promise.reject('You are blocked by this user')
        }
      }
    ]),
    mutations.invitationCreate,
    promiseToPostResolver([
      ({ user }, payload) => InvitationRepository.sendEmail(payload, user),
      ({ user }, payload) => InvitationRepository.sendNotificationAlertOnInvitation(payload, user)
    ])
  ])

  mutations.invitationUpdateById = chainToResolver([
    mutations.invitationUpdateById,
    promiseToPostResolver([
      ({ user }, payload) => InvitationRepository.emailOnUpdate(payload, user),
      ({ user }, payload) => InvitationRepository.sendNotificationAlertOnModifyInv(payload, user)
    ])
  ])

  schemaComposer
    .rootQuery()
    .addFields({
      ...attachToAll(isAuthenticated)(queries)
    })

  schemaComposer
    .rootMutation()
    .addFields({
      ...attachToAll(isAuthenticated)(mutations)
    })

  TC.InvitationTC = InvitationTC

  return InvitationTC
}
