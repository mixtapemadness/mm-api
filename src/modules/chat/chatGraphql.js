var { composeWithMongoose } = require('graphql-compose-mongoose/node8')
const customizationOptions = {} // left it empty for simplicity, described below

module.exports = ({
  ChatModel,
  MessageModel,
  isAuthenticated,
  TC,
  chatRepository
}) => {
  const { schemaComposer, UserTC, BookingTC } = TC
  const ChatTC = composeWithMongoose(ChatModel, customizationOptions)
  const MessageTC = composeWithMongoose(MessageModel, {})

  // ChatTC.addRelation('conversation',
  //   {
  //     resolver: () => MessageTC.getResolver('findMany'),
  //     // prepareArgs: {
  //     //   filter: source => ({ chatId: source._id })
  //     // },
  //     projection: { chatId: true }
  //   }
  // )
  const findManyMessagesResolver = MessageTC.getResolver('findMany')
  ChatTC.addFields({
    conversation: {
      type: findManyMessagesResolver,
      args: findManyMessagesResolver.getArgs(),
      resolve: (source, args, context, info) => {
        return findManyMessagesResolver.resolve({
          source,
          args,
          context,
          info,
          rawQuery: {
            chatId: source._id.toString()
          }
        })
      },
      projection: { _id: true }
    }
  })

  ChatTC.addRelation('fromUserObj',
    {
      resolver: () => UserTC.getResolver('findOne'),
      prepareArgs: {
        filter: source => ({ _id: source.fromUser })
      },
      projection: { fromUser: true }
    }
  )

  ChatTC.addRelation('toUserObj',
    {
      resolver: () => UserTC.getResolver('findOne'),
      prepareArgs: {
        filter: source => ({ _id: source.toUser })
      },
      projection: { toUser: true }
    }
  )

  ChatTC.addRelation('booking',
    {
      resolver: () => BookingTC.getResolver('findOne'),
      prepareArgs: {
        filter: source => ({ _id: source.bookingId })
      },
      projection: { bookingId: true }
    }
  )

  // ChatTC.addResolver({
  //   name: 'saveMessage',
  //   args: {
  //     chatId: ChatTC.getFieldType('_id'),
  //     message: 'String!'
  //   },
  //   type: ChatTC,
  //   resolve: async ({ args, context: { user } }) => {
  //     const message = args

  //     return chatRepository.saveMessage(
  //       Object.assign({}, message, { user })
  //     )
  //   }
  // })

  ChatTC.addResolver({
    name: 'saveMessage',
    args: {
      chatId: ChatTC.getFieldType('_id'),
      message: 'String!',
      label: 'String'
    },
    type: MessageTC,
    resolve: async ({ args, context: { user } }) => {
      const chat = await global.db.ChatModel.findOne({ _id: args.chatId })
      const receiverId = String(chat.fromUser) === String(user._id)
        ? chat.toUser : chat.fromUser

      const isBlocked = await global.db.UserModel.count({
        _id: receiverId,
        blockedUsers: user._id
      })

      if (isBlocked) {
        return Promise.reject('You are blocked by this user')
      }

      const message = args
      return chatRepository.saveMessage(
        Object.assign({}, message, { user })
      )
    }
  })

  schemaComposer.rootQuery().addFields({
    chatById: ChatTC.getResolver('findById'),
    chatByIds: ChatTC.getResolver('findByIds'),
    chatOne: ChatTC.getResolver('findOne'),
    chatMany: ChatTC.getResolver('findMany'),
    chatCount: ChatTC.getResolver('count'),
    chatConnection: ChatTC.getResolver('connection'),
    chatPagination: ChatTC.getResolver('pagination')
  })

  schemaComposer.rootMutation().addFields({
    chatCreate: ChatTC.getResolver('createOne'),
    chatUpdateById: ChatTC.getResolver('updateById'),
    chatUpdateOne: ChatTC.getResolver('updateOne'),
    chatUpdateMany: ChatTC.getResolver('updateMany'),
    chatRemoveById: ChatTC.getResolver('removeById'),
    chatRemoveOne: ChatTC.getResolver('removeOne'),
    chatRemoveMany: ChatTC.getResolver('removeMany'),
    chatSaveMessage: ChatTC.getResolver('saveMessage')
  })

  TC.ChatTC = ChatTC
  return ChatTC
}
