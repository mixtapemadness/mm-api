var _ = require('lodash')

module.exports = function (server) {
  var io = require('socket.io')(server)
  let users = {

  }

  io.on('connection', function (client) {
    client.on('login', (user) => {
      client.user = user
      users[user.id] = client

      const userIds = Object.keys(users)
      _.forOwn(users, (userClient, key) => {
        userClient.emit('onlineUserIds', userIds)
      })
    })

    client.on('disconnect', () => {
      if (client.user && client.user.id) {
        delete users[client.user.id]
      }
    })

    client.on('onlineUserIds', (userIds) => {
      const result = userIds.map(userId => {
        if (users[userId]) {
          return { userId, online: true }
        }
        return { userId, online: false }
      })
      client.emit('onlineUserIds', result)
    })

    client.on('chat', (data) => {
      const { toUserId, fromUserId, type, message } = data
      const userClient = users[toUserId]
      // todo save in the database

      if (userClient) {
        userClient.emit('chat', { fromUserId, type, message })
      }
    })

    client.on('notification', (data) => {
      try {
        const { userId, message } = data
        const userClient = users[userId]
        if (userClient) {
          userClient.emit('notification', message)
        }
      } catch (err) {
        console.log(err)
      }
    })

    client.on('mail', (data) => {
      try {
        const { userId, message } = data
        const userClient = users[userId]
        if (userClient) {
          userClient.emit('mail', message)
        }
      } catch (err) {
        console.log(err)
      }
    })
  })
}
