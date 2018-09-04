
var { composeWithMongoose } = require('graphql-compose-mongoose/node8')

const customizationOptions = {} // left it empty for simplicity, described below

module.exports = ({NotificationModel, isAuthenticated, TC}) => {
  const { schemaComposer, UserTC } = TC
  const NotificationTC = composeWithMongoose(NotificationModel, customizationOptions)

  NotificationTC.addRelation('userObj',
    {
      resolver: () => UserTC.getResolver('findOne'),
      prepareArgs: {
        filter: source => ({ _id: source.actionUser })
      },
      projection: { user: true }
    }
)

  const myNotifications =
    NotificationTC.getResolver('findMany').wrapResolve(next => rp => {
      if (!rp.args.filter) {
        rp.args.filter = {}
      }
      rp.args.filter.owner = rp.context.user._id
      return next(rp)
    })

  const notificationRemoveAll =
    NotificationTC.getResolver('removeMany').wrapResolve(next => rp => {
      if (!rp.args.filter) {
        rp.args.filter = {}
      }
      rp.args.filter.owner = rp.context.user._id
      return next(rp)
    })

  const notificationMarkAllAsRead =
    NotificationTC.getResolver('updateMany').wrapResolve(next => rp => {
      if (!rp.args.filter) {
        rp.args.filter = {}
      }
      rp.args.filter.owner = rp.context.user._id
      return next(rp)
    })

  schemaComposer.rootQuery().addFields({
    myNotifications,
    notificationById: NotificationTC.getResolver('findById'),
    notificationByIds: NotificationTC.getResolver('findByIds'),
    notificationOne: NotificationTC.getResolver('findOne'),
    notificationMany: NotificationTC.getResolver('findMany'),
    notificationCount: NotificationTC.getResolver('count'),
    notificationConnection: NotificationTC.getResolver('connection'),
    notificationPagination: NotificationTC.getResolver('pagination')
  })

  schemaComposer.rootMutation().addFields({
    notificationMarkAllAsRead,
    notificationRemoveAll,
    notificationCreate: NotificationTC.getResolver('createOne'),
    notificationUpdateById: NotificationTC.getResolver('updateById'),
    notificationUpdateOne: NotificationTC.getResolver('updateOne'),
    notificationUpdateMany: NotificationTC.getResolver('updateMany'),
    notificationRemoveById: NotificationTC.getResolver('removeById'),
    notificationRemoveOne: NotificationTC.getResolver('removeOne'),
    notificationRemoveMany: NotificationTC.getResolver('removeMany')
  })

  TC.NotificationTC = NotificationTC
  return NotificationTC
}
