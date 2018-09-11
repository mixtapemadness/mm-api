
var { composeWithMongoose } = require('graphql-compose-mongoose/node8')
const customizationOptions = {} // left it empty for simplicity, described below

const {
  chainToResolver,
  promiseToPreResolver,
  addOneToOneRelation
} = require('../core/graphql')

module.exports = ({ EventModel, isAuthenticated, TC, repo }) => {
  const { schemaComposer, UserTC } = TC
  const EventTC = composeWithMongoose(EventModel, customizationOptions)

  addOneToOneRelation({
    ModelTC: EventTC,
    RelationTC: UserTC,
    name: 'userObj',
    relPropName: 'user'
  })

  // const findResolverByUser = next => rp => {
  //   const { user } = rp.context
  //   if (!rp.args.filter) {
  //     rp.args.filter = {}
  //   }
  //   rp.args.filter.user = user
  //   return next(rp)
  // }

  const findByIdResolverByUser = (next) => async (rp) => {
    const result = await next(rp)
    if (result.user !== rp.context.user) {
      throw new Error('Not allowed')
    }
    return result
  }

  const createOneWithUser = next => (rp) => {
    rp.args.record.user = rp.context.user._id
    return next(rp)
  }

  const updateOne = next => req => {
    if (req.context.user._id !== req.args.input.record._id) {
      throw new Error('Not allowed')
    }

    delete req.args.input.record.visited
    delete req.args.input.record.restaurant
    return next(req)
  }

  const eventRemoveById = chainToResolver([
    promiseToPreResolver([
      ({ args, user }) => repo.removeFilesOfEvent(args)
    ]),
    EventTC.getResolver('removeById')
  ])

  EventTC.addResolver({
    name: 'eventManyByUsers',
    args: {
      type: EventTC.getFieldType('type'),
      users: [EventTC.getFieldType('user')]
    },
    type: [EventTC],
    resolve: async ({ args, context }) => repo.getEvents(args, context.user)
  })

  schemaComposer.rootQuery().addFields({
    // eventById: EventTC.getResolver('findById').wrapResolve(findByIdResolverByUser),
    eventById: EventTC.getResolver('findById'),
    eventByIds: EventTC.get('$findByIds'),
    eventOne: EventTC.get('$findOne'),
    // eventMany: EventTC.get('$findMany').wrapResolve(findResolverByUser),
    eventMany: EventTC.get('$findMany'),
    eventCount: EventTC.get('$count'),
    eventConnection: EventTC.get('$connection'),
    eventPagination: EventTC.get('$pagination'),
    eventManyByUsers: EventTC.getResolver('eventManyByUsers')
  })

  schemaComposer.rootMutation().addFields({
    eventCreate: EventTC.getResolver('createOne').wrapResolve(createOneWithUser),
    eventUpdateById: EventTC.getResolver('updateById'),
    eventUpdateOne: EventTC.getResolver('updateOne'),
    eventUpdateMany: EventTC.getResolver('updateMany'),
    eventRemoveOne: EventTC.getResolver('removeOne'),
    eventRemoveMany: EventTC.getResolver('removeMany'),
    eventRemoveById
  })

  TC.EventTC = EventTC
  return EventTC
}
