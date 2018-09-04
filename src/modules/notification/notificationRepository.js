/* eslint handle-callback-err:0 */
'use strict'

var Promise = require('bluebird')
var roles = require('../roles/roles').roles
const PushNotifications = require('./pushNotifications')

class notificationRepository {
  constructor ({db}) {
    this.pushNotification = new PushNotifications()
    this.db = db
  }

  /**
   *
   * @param {string} toUserId
   * @param {string} message
   * @param {string} actionId
   * @param {string} actionType
   * @param {string} modelName
   * @param {object} currentUser
   */
  async registerNotification (toUserId, message, actionId, actionType, modelName, currentUser) {
    // return new Promise((resolve, reject) => {
      // const { _id: currUserId } = currentUser
      // let newItem = {
      //   message,
      //   owner: toUserId,
      //   actionUser: currUserId,
      //   actionType: 'Chat',
      //   actionId: actionId,
      //   objectName: modelName
      // }
      // switch (modelName) {
      //   case 'Group':
      //     newItem.group = actionId
      //     break
      //   case 'Tag':
      //     newItem.tag = actionId
      //     break
      //   case 'Task':
      //     newItem.task = actionId
      //     break
      //   case 'Prospect':
      //     newItem.prospect = actionId
      //     break
      //   case 'Contact':
      //     newItem.contact = actionId
      //     break
      //   case 'Team':
      //     newItem.team = actionId
      //     break
      //   case 'User':
      //     newItem.user = actionId
      //     break
      // }
      // await global.sendSocketNotificationToUser(newItem, toUserId)
      // const pushMessage = `${currentUser.firstName} ${currentUser.lastName} ${message}`
      // this.pushNotification.sendPushNotification(toUserId, pushMessage, actionType, { text: pushMessage })
      // return await this.addNotificationInDatabase(newItem)
    // })
    const { _id: currUserId } = currentUser
    let newItem = {
      message,
      owner: toUserId,
      actionUser: currUserId,
      actionType: actionType,
      actionId: actionId,
      objectName: modelName
    }
    const result = await this.addNotificationInDatabase(newItem)
    await global.sendSocketNotificationToUser(
      Object.assign({}, newItem, { _id: result._id }),
      toUserId
    )
  }

  crudNotification (currentUser, message, actionType, modelName, actionItem) {
    const { _id: currUserId, company: { _id: companyId }, team: teamId } = currentUser
    const { _id: actionId } = actionItem
    const query = {
      $or: [
        { company: companyId, _id: { $ne: currUserId }, role: { $in: [roles.EAM, roles.ADMIN] }, status: { $ne: 'deleted' } },
        { company: companyId, _id: { $ne: currUserId }, role: roles.TEAM_LEADER, team: teamId, status: { $ne: 'deleted' } }
      ]
    }
    global.db.UserModel.find(query)
      .then((users) => {
        return Promise.all(users).map((user) => {
          const { _id: userId } = user
          this.registerNotification(userId, message, actionId, actionType, modelName, currentUser)
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  async addNotificationInDatabase (notification) {
    const model = new global.db.NotificationModel(notification)
    return await model.save()

    // return model.save()
    //   .then((data) => {
    //     return Promise.resolve(data)
    //   })
    //   .catch((error) => {
    //     return Promise.reject(error)
    //   })
  }
}

module.exports = notificationRepository

