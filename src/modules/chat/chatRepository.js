/* eslint handle-callback-err:0 */
'use strict'

// var Promise = require('bluebird')
// var roles = require('../roles/roles').roles
// var MailService = require('../../services/mailgun/mailgunService')
var R = require('ramda')

class ChatRepo {

  constructor ({ db, notificationRepository }) {
    this.notificationRepository = notificationRepository
    this.db = db
  }

  async saveMessage (data) {
    try {
      const { user } = data
      const message = R.omit(['user'], data)

      if (!message.message) {
        throw new Error('Message can not be empty')
      }

      const chat = await this.db.ChatModel.findOne({ _id: message.chatId })

      if (!chat) {
        throw new Error('Chat not found')
      }

      if (String(chat.fromUser) !== String(user._id) && String(chat.toUser) !== String(user._id)) {
        if (user.role !== 'bookingAgent') {
          throw new Error('Chat not found')
        }

        const booking = await this.db.BookingModel.findOne({ _id: chat.bookingId })

        if (!booking) {
          throw new Error('Booking not found')
        }

        const isInvited = await this.db.InvitationModel.count({
          status: 'accepted',
          $or: [
            { creator: user._id, receiverId: booking.talentId },
            { creator: booking.talentId, receiverId: user._id }
          ]
        })

        if (!isInvited) {
          throw new Error('Chat not found')
        }
      }

      const to = String(user._id) === String(chat.toUser) ? chat.fromUser : chat.toUser

      const MessageModel = this.db.MessageModel
      const newMessage = new MessageModel({
        chatId: chat._id,
        fromUser: user._id,
        message: message.message,
        label: message.label,
        sendAt: new Date()
      })
      const lastMsg = await newMessage.save()
      // chat.conversation.push({
      //   fromUser: user._id,
      //   message: message.message,
      //   sendAt: new Date()
      // })

      chat.unread.pop()
      chat.unread.push(to)
      await chat.save()
      // const result = await chat.save()

      // const lastMsg = R.last(result.conversation)

      global.sendSocketMessageToUser(
        to,
        user._id,
        'chat',
        Object.assign(
          {},
          R.pick(['_id', 'sendAt', 'message', 'fromUser', 'label'], lastMsg),
          {
            __typename: 'Message'
          }
        )
      )

      // await this.notificationRepository.registerNotification(
      //   to,
      //   message.message,
      //   chat._id,
      //   'NewMessage',
      //   'Chat',
      //   user
      // )

      return new Promise(resolve => resolve(lastMsg))
      // return lastMsg
    } catch (e) {
      return Promise.reject(e)
    }
  }

  // sendMail (email, body, userId, role) {
  //   return global.db.UserModel.findOne({email: email})
  //       .then(user => {
  //         if (!user) {
  //           return Promise.reject({message: 'User not found!'})
  //         }
  //         let sentByAdmin = (role === roles.admin || role === roles.superAdmin)

  //         const mail = {
  //           toUser: user._id,
  //           fromUser: userId,
  //           subject: body.subject,
  //           conversation: [{
  //             'message': body.message,
  //             fromUser: userId
  //           }],
  //           unread: [user._id],
  //           sentByAdmin: sentByAdmin
  //         }
  //         let model = new global.db.ChatModel(mail)

  //         MailService.sendInbox(user)

  //         global.sendSocketMailToUser(mail, user._id)

  //         return model.save()
  //       })
  //       .then((data) => {
  //         return Promise.resolve(data)
  //       })
  //       .catch((err) => {
  //         return Promise.reject(err)
  //       })
  //       .catch((err) => {
  //         return Promise.reject(err)
  //       })
  // }
}

module.exports = ChatRepo
