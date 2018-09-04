/* eslint handle-callback-err:0 */
'use strict'

const Expo = require('exponent-server-sdk')

let expo = new Expo()

class PushNotifications {

  async sendPushNotification (toUser, message, type, data) {
    //  if touserId is only id then get full user with this id
    let devices = []
    // if (typeof toUser === 'string') {
    toUser = await global.db.UserModel.findOne({ _id: toUser })
    // }
    devices = toUser.devices

    // const { devices } = toUserId // get all devices from user
    if (devices && devices.length > 0) { // if devices is > 0 then send notifications
      devices.forEach(async (token) => {
        if (token !== null) {
          try {
            let receipts = await expo.sendPushNotificationsAsync([{
              // The push token for the app user to whom you want to send the notification
              // to: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
              to: token,
              sound: 'default',
              body: message,
              data: data
            }])
          } catch (error) {
            console.error('error: ', error)
          }
        }
      })
    }
  }

  createPushNotification (req, res) {
    const { pushTo } = req.body
  }
}

module.exports = PushNotifications
