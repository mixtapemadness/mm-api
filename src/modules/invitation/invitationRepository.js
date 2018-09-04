/* eslint handle-callback-err:0 */
'use strict'

class InvitationRepository {
  constructor ({ db, notificationRepository }) {
    this.db = db
    this.mailService = require('../../services/sendgrid/sendgridSevice')
    this.notificationRepository = notificationRepository
  }

  async sendEmail ({ record }, user) {
    try {
      const receiver = await this.db.UserModel.findOne({ _id: record.receiverId })

      return await this.mailService.send({
        templateName: 'invitationCreate',
        templateData: {
          sender: user,
          receiver,
          invitation: record
        },
        to: receiver.email,
        subject: 'New Invitation Received'
      })
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async emailOnUpdate ({ record }, user) {
    try {
      const _id = String(record.receiverId) === String(user._id)
        ? record.creator : record.receiverId

      const receiver = await this.db.UserModel.findOne({ _id })

      const templateData = {
        sender: user,
        receiver,
        invitation: record
      }

      switch (record.status) {
        case 'accepted':
          return await this.mailService.send({
            templateName: 'invitationAccepted',
            templateData,
            to: receiver.email,
            subject: 'Your invitation request was accepted'
          })
        case 'declined':
          return await this.mailService.send({
            templateName: 'invitationDeclined',
            templateData,
            to: receiver.email,
            subject: 'Your invitation request was declined'
          })
        case 'canceled':
          return await this.mailService.send({
            templateName: 'invitationCanceled',
            templateData,
            to: receiver.email,
            subject: 'Your invitation was canceled'
          })
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async sendNotificationAlertOnInvitation ({ record }, user) {
    try {
      return await this.notificationRepository.registerNotification(
        record.receiverId, // to
        `You have received invitation from ${user.fullName}`, // message text
        record._id, // actionId
        'NewInvitation', // actionType
        'Invitation', // modelName
        user // receiver
      )
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async sendNotificationAlertOnModifyInv ({ record }, user) {
    try {
      const to = String(record.receiverId) === String(user._id)
        ? record.creator : record.receiverId

      const sender = await this.db.UserModel.findOne({ _id: user._id })
      const info = {}

      switch (record.status) {
        case 'requested':
          info.message = `You have received invitation from ${sender.fullName}`
          info.actionType = 'NewInvitation'
          break
        case 'accepted':
          info.message = `${sender.fullName} accepted your invitation`
          info.actionType = 'InvitationAccepted'
          break
        case 'declined':
          info.message = `${sender.fullName} declined your invitation`
          info.actionType = 'InvitationDeclined'
          break
        case 'canceled':
          info.message = `${sender.fullName} cancelled agreement`
          info.actionType = 'InvitationCanceled'
          break
      }

      return await this.notificationRepository.registerNotification(
        to, // to
        info.message, // message text
        record._id, // actionId
        info.actionType, // actionType
        'Invitation', // modelName
        user // receiver
      )
    } catch (e) {
      return Promise.reject(e)
    }
  }

}

module.exports = InvitationRepository
