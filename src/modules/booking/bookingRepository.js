/* eslint handle-callback-err:0 */
'use strict'

const uniq = require('lodash/uniq')

class BookingRepository {
  constructor({ db, notificationRepository }) {
    this.db = db
    this.notificationRepository = notificationRepository
    this.mailService = require('../../services/sendgrid/sendgridSevice')
  }

  async isTalent({ record }, user) {
    try {
      const booking = await this.db.BookingModel.findOne({ _id: record._id })
      if (!booking) {
        throw new Error('Booking not found')
      }
      return String(user._id) === String(booking.talentId)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async initializeChat(payload) {
    try {
      const { record } = payload
      const conversation = []

      if (record.text) {
        conversation.push({
          message: record.text,
          fromUser: record.bookerId
        })
      }

      const chat = new this.db.ChatModel({
        fromUser: record.bookerId,
        toUser: record.talentId,
        unread: [record.talentId],
        conversation,
        subject: record.eventType,
        bookingId: payload.record._id
      })

      return await chat.save()
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getBookingsByUsers(args, user) {
    var preparedArgs = {}

    if (args.users && args.users.length) {
      preparedArgs.$or = [
        { talentId: { $in: args.users } },
        { bookerId: { $in: args.users } }
      ]
    } else {
      return []
    }

    if (args.status && args.status.length) {
      preparedArgs.status = { $in: args.status }
    }

    if (args.fromDate) {
      preparedArgs.endDate = { $gte: args.fromDate }
    }

    return await global.db.BookingModel.find(preparedArgs)
  }

  async getChatId({ _id }) {
    const chat = await this.db.ChatModel.findOne({ bookingId: _id }, '_id')
    return chat._id
  }

  async getFeePaid({ _id }) {
    // const Payments = await this.db.PaymentModel.find({ bookingId: _id, status: 'COMPLETED' }, 'amount')
    const Payments = await this.db.PaymentModel.find({ bookingId: _id }, 'amount')
    let sum = 0
    if (Payments) {
      sum = Payments.reduce((acc, p) => p.amount + acc, 0)
    }
    return sum
  }

  async getFeeRemained({ _id }) {
    const booking = await this.db.BookingModel.findOne({ _id }, 'fee')
    // const Payments = await this.db.PaymentModel.find({ bookingId: _id, status: 'COMPLETED' }, 'amount')
    const Payments = await this.db.PaymentModel.find({ bookingId: _id }, 'amount')
    let sum = 0
    if (Payments) {
      sum = Payments.reduce((acc, p) => p.amount + acc, 0)
    }
    return booking.fee - sum
  }

  async isDateRangeValid({ start, end, talentId }) {
    if (start > end) {
      return false
    }

    if (start < new Date()) {
      return false
    }

    const bookingsCount = await this.db.BookingModel.count({
      talentId,
      status: { $in: ['accepted', 'booked'] },
      $or: [
        { startDate: { $gte: start, $lte: end } },
        { endDate: { $gte: start, $lte: end } },
        { startDate: { $lte: start }, endDate: { $gte: end } }
      ]
    })

    if (bookingsCount) {
      return false
    }

    const talent = await this.db.UserModel.findOne({ _id: talentId })

    if (!talent.blockedDates) {
      return true
    }

    const loopEnd = new Date(end)
    loopEnd.setDate(loopEnd.getDate() + 1)
    loopEnd.setHours(0, 0, 0, 0)

    for (let m = new Date(start); m < loopEnd; m.setDate(m.getDate() + 1)) {
      if (talent.blockedDates[`${m.getFullYear()}/${m.getMonth()}/${m.getDate()}`]) {
        return false
      }
    }

    return true
  }

  isUserBlocked(talentId, userId) {
    return this.db.UserModel.count({ _id: talentId, blockedUsers: userId })
  }

  async guessRole(booking, user) {
    try {
      let role = ''

      if (String(booking.talentId) === String(user._id)) {
        role = 'talent'
      } else if (String(booking.bookerId) === String(user._id)) {
        role = 'booker'
      } else if (user.role === 'bookingAgent') {
        const bookingAgentsCount = await this.db.InvitationModel.count({
          status: 'accepted',
          $or: [
            { creator: booking.talentId, receiverId: user._id },
            { creator: user._id, receiverId: booking.talentId }
          ]
        })
        if (bookingAgentsCount > 0) {
          role = 'bookingAgent'
        }
      }

      return role
    } catch (e) {
      return Promise.reject(e.message)
    }
  }

  async changeStatus({ record: { _id, status } }) {
    try {
      const booking = await this.db.BookingModel.findOne({ _id })
      booking.status = status
      return booking.save()
    } catch (e) {
      return Promise.reject(e.message)
    }
  }

  async ensureCreatePermissions({ record, user }) {
    try {
      if (String(record.talentId) === String(user._id)) {
        throw new Error('You can not book yourself')
      }
      if (record.bookerId && (String(record.bookerId) !== String(user._id))) {
        throw new Error('You can book only for yourself')
      }
      if (await this.isUserBlocked(record.talentId, user._id)) {
        throw new Error('You are blocked by this user')
      }

      const isValid = await this.isDateRangeValid({
        start: record.startDate,
        end: record.endDate,
        talentId: record.talentId
      })

      if (!isValid) {
        throw new Error('Provided dates are not valid')
      }
    } catch (e) {
      return Promise.reject(e.message)
    }
  }

  async ensureUpdatePermissions({ record, user }) {
    try {
      const booking = await this.db.BookingModel.findOne({ _id: record._id })
      if (!booking) {
        throw new Error('Booking not found')
      }

      const role = await this.guessRole(booking, user)
      if (!role) {
        throw new Error('You do not have permissions')
      }
    } catch (e) {
      return Promise.reject(e.message)
    }
  }

  async ensureChangeStatusPermissions({ record: { _id, status }, user }) {
    try {
      const booking = await this.db.BookingModel.findOne({ _id })
      if (!booking) {
        throw new Error('Booking not found')
      }

      const role = await this.guessRole(booking, user)
      if (!role) {
        throw new Error('You do not have permissions')
      }

      switch (status) {
        case 'confirmed':
          if (booking.status !== 'modified') {
            throw new Error('Invalid status')
          }
          if (role !== 'booker') {
            throw new Error('You do not have permissions')
          }
          break
        case 'accepted':
          if (!['confirmed', 'request'].includes(booking.status)) {
            throw new Error('Invalid status')
          }
          if (!['talent', 'bookingAgent'].includes(role)) {
            throw new Error('You do not have permissions')
          }

          const isValid = await this.isDateRangeValid({
            start: booking.startDate,
            end: booking.endDate,
            talentId: booking.talentId
          })

          if (!isValid) {
            throw new Error('Booking dates are not available')
          }
          break
        case 'declined':
          if (!['request', 'modified', 'confirmed', 'accepted'].includes(booking.status)) {
            throw new Error('Invalid status')
          }
          break
        case 'canceled':
          // TODO: Tmp fix. It needs to check payments and refund if needed before cancel / decline
          if (booking.status !== 'booked') {
            throw new Error('Invalid status')
          }
          break
        case 'completed':
          if (booking.status !== 'booked' || (booking.endDate > new Date())) {
            throw new Error('Invalid status')
          }
          break
        default:
          throw new Error('Invalid status')
      }
    } catch (e) {
      return Promise.reject(e.message)
    }
  }

  async notifyFriends(record, user, options) {
    try {
      const friends = await this.db.InvitationModel.find({
        status: 'accepted',
        $or: [
          { creator: { $in: [record.bookerId, record.talentId] } },
          { receiverId: { $in: [record.bookerId, record.talentId] } }
        ]
      }, '_id creator receiverId')

      const friendIds = uniq(friends.map(
        f => String(f.creator) === String(record.bookerId) ||
          String(f.creator) === String(record.talentId)
          ? String(f.receiverId) : String(f.creator)
      )).filter(_id => _id !== String(record.bookerId) && _id !== String(record.talentId))

      friendIds.forEach(_id => {
        if (String(_id) !== String(user._id)) {
          this.notificationRepository.registerNotification(
            _id, // to
            options.message, // message text
            record._id, // actionId
            options.actionType, // actionType
            options.modelName, // modelName
            user // receiver
          )
        }
      })
    } catch (e) {
      console.log('Error in notifyFriends:', e)
    }
  }

  async notifyOnCreate(payload, user) {
    try {
      const { record } = payload

      const options = {
        message: 'New booking request received',
        actionType: 'NewBooking',
        modelName: 'Booking'
      }

      this.notifyFriends(record, user, options)

      const to = String(user._id) === String(record.talentId)
        ? record.bookerId : record.talentId

      return await this.notificationRepository.registerNotification(
        to, // to
        options.message, // message text
        record._id, // actionId
        options.actionType, // actionType
        options.modelName, // modelName
        user // receiver
      )
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async notifyOnStatusChange(record, user) {
    try {
      const options = {
        modelName: 'Booking'
      }

      switch (record.status) {
        case 'modified':
          options.message = 'Booking modified'
          options.actionType = 'BookingModified'
          break
        case 'confirmed':
          options.message = 'Booking changes confirmed'
          options.actionType = 'BookingConfirmed'
          break
        case 'accepted':
          options.message = 'Booking request accepted by talent'
          options.actionType = 'BookingAccepted'
          break
        case 'declined':
          options.message = 'Booking declined'
          options.actionType = 'BookingDeclined'
          break
        case 'booked':
          options.message = 'Booking activated'
          options.actionType = 'BookingBooked'
          break
        case 'canceled':
          options.message = 'Booking canceled'
          options.actionType = 'BookingCanceled'
          break
        case 'completed':
          options.message = 'Booking completed'
          options.actionType = 'BookingCompleted'
          break
        default:
          options.message = `Booking undetermined status - ${record.status}`
          options.actionType = 'BookingDefault'
          break
      }

      this.notifyFriends(record, user, options)

      const to = String(user._id) === String(record.bookerId)
        ? record.talentId : record.bookerId

      return await this.notificationRepository.registerNotification(
        to, // to
        options.message, // message text
        record._id, // actionId
        options.actionType, // actionType
        options.modelName, // modelName
        user // receiver
      )
    } catch (e) {
      // TODO: may we do not need to reject promise on notification failure!!!
      return Promise.reject(e.message)
    }
  }

  async emailOnCreate({ record }, user) {
    try {
      const talent = await this.db.UserModel.findOne({ _id: record.talentId })
      return await this.mailService.send({
        templateName: 'bookingCreated',
        templateData: {
          sender: user,
          receiver: talent,
          booking: record
        },
        to: talent.email,
        subject: 'Booking request received'
      })
    } catch (e) {
      // TODO: may we do not need to reject promise on email failure!!!
      return Promise.reject(e)
    }
  }

  async emailOnStatusChange(record, user) {
    try {
      const _id = String(user._id) === String(record.bookerId)
        ? record.talentId : record.bookerId

      const receiver = await this.db.UserModel.findOne({ _id })

      const templateData = {
        sender: user,
        receiver,
        booking: record
      }
      const templateDataForSender = {
        sender: receiver,
        receiver: user,
        booking: record
      }

      switch (record.status) {
        case 'modified':
          return await this.mailService.send({
            templateName: 'bookingModified',
            templateData,
            to: receiver.email,
            subject: 'Your booking request terms modified - Review it now'
          })
        case 'confirmed':
          return await this.mailService.send({
            templateName: 'bookingConfirmed',
            templateData,
            to: receiver.email,
            subject: 'Your booking request modifications confirmed - Review it now'
          })
        case 'accepted':
          return await this.mailService.send({
            templateName: 'bookingAccepted',
            templateData,
            to: receiver.email,
            subject: 'Congratulations! Your booking request was accepted'
          })
        case 'declined':
          return await this.mailService.send({
            templateName: 'bookingDeclined',
            templateData,
            to: receiver.email,
            subject: 'Booking request was declined'
          })
        // TODO: send email to both side
        case 'booked':
          await this.mailService.send({
            templateName: 'bookingBooked',
            templateData: templateDataForSender,
            to: user.email,
            subject: 'Congratulations! Booking was activated'
          })
          return await this.mailService.send({
            templateName: 'bookingBooked',
            templateData,
            to: receiver.email,
            subject: 'Congratulations! Booking was activated'
          })
        // TODO: send email to both side
        case 'canceled':
          console.log('templateDataForSender: ', templateDataForSender)
          await this.mailService.send({
            templateName: 'bookingCanceled',
            templateData: templateDataForSender,
            to: user.email,
            subject: 'Booking was canceled'
          })
          return await this.mailService.send({
            templateName: 'bookingCanceled',
            templateData,
            to: receiver.email,
            subject: 'Booking was canceled'
          })
        case 'completed':
          return await this.mailService.send({
            templateName: 'bookingCompleted',
            templateData,
            to: receiver.email,
            subject: 'Your booking completed'
          })
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

module.exports = BookingRepository
