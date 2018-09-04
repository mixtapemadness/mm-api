'use strict'

const roles = require('../roles/roles').roles
// var ChatRepo = require('./chatRepository')

class ChatController {
  constructor ({ db, chatRepository }) {
    this.db = db
    this.chatRepository = chatRepository
  }

  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/chat/ping  test route ping chat routes
   * @apiName Ping
   * @apiGroup Chat
   * @apiPermission Public
   * @apiDescription Ping chat routes
   *
   *
   * @apiUse defaultSuccessExample201
   * @apiUse Errors
  */
  ping (req, res) {
    res.ok('ping chat controller')
  }

  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/chat?pageSize=:pageSize&page=:page&sort=:sort&select=:select&where=:where&populate=:populate Get mail list by user
   * @apiName list
   * @apiGroup Chat
   * @apiPermission Authorization
   * @apiDescription Get mail list by user
   *
   * @apiUse defaultQueryParams
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : { }
   *     }
   *
   * @apiUse Errors
   */
  list (req, res) {
    const { user: {id: userId} } = req
    const options = {
      where: { $or: [{toUser: userId}, {fromUser: userId}] },
      promise: true
    }
    global.db.ChatModel.httpGet(req, res, options)

    // global.db.ChatModel.find({ $or: [{toUser: userId}, {fromUser: userId}] })
    //     .populate('fromUser conversation.fromUser')
        .then((data) => {
          let result = {
            items: [],
            totalCount: data.totalCount
          }
          data.items.map(mail => {
            const conversation = mail.conversation.filter(item => item.deleted.indexOf(userId) < 0)
            if (conversation && conversation.length) {
              mail.conversation = conversation
              result.items.push(mail)
            }
          })
          res.ok(result)
        })
        .catch(res.catchError)
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/chat Send start mail to user
   * @apiName send
   * @apiGroup Chat
   * @apiPermission Authorization
   * @apiDescription Send start mail to user
   *
   * @apiParam {String} email receiver user email
   * @apiParam {String} subject mail subject
   * @apiParam {String} message mail text
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : { }
   *     }
   *
   * @apiUse Errors
   */
  send (req, res) {
    const { user: { _id: userId}, params: {id}, body } = req
    const {role} = req.user

    if ((role === roles.admin || role === roles.superAdmin)) {
      return this.chatRepository.sendMail(body.email, body, userId, role)
                .then((data) => {
                  return res.ok(data)
                })
                .catch((err) => {
                  return res.badRequest(err.message)
                })
    } else {
      const query = {
        role: {$in: [roles.superAdmin, roles.admin] }
      }

      global.db.UserModel.find(query)
        .then((users) => {
          let promises = []
          users.map(user => {
            promises.push(
                    this.chatRepository.sendMail(user.email, body, userId, role)
                )
          })
          return Promise.all(promises).then((result) => {
            res.ok()
          })
        })
        .catch((err) => {
          return res.badRequest(err.message)
        })
    }
  }

  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/chat/:id View conversation
   * @apiName view
   * @apiGroup Chat
   * @apiPermission Authorization
   * @apiDescription View conversation
   *
   * @apiParam {string} id Mail unique ID.
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : { }
   *     }
   *
   * @apiUse Errors
   */
  view (req, res) {
    const { user: {_id: userId}, params: {id} } = req
    global.db.ChatModel.findById(id)
    .then(mail => {
      const index = mail.unread.indexOf(userId)
      if (index > -1) {
        mail.unread.splice(index, 1)
      }
      return mail.save()
    })
    .then(() => {
        // global.db.ChatModel.httpGet(req, res)
      return global.db.ChatModel.findById(id).populate('toUser fromUser conversation.fromUser conversation.attachment')
    })
    .then((mail) => {
      const conversation = mail.conversation.filter(item => item.deleted.indexOf(userId) < 0)
      mail.conversation = conversation
      res.ok(mail)
    })
    .catch(res.catchError)
  }

  /**
   * @apiVersion 1.0.0
   * @api {delete} /api/v1/chat/:id Delete conversation
   * @apiName view
   * @apiGroup Chat
   * @apiPermission Authorization
   * @apiDescription Delete conversation
   *
   * @apiParam {string} id Mail unique ID.
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : { }
   *     }
   *
   * @apiUse Errors
   */
  delete (req, res) {
    const { user: {_id: userId}, params: {id} } = req
    global.db.ChatModel.findById(id)
    .then(mail => {
      mail.conversation.map(message => {
        if (message.deleted.indexOf(userId) < 0) {
          message.deleted.push(userId)
        }
      })
      return mail.save()
    })
    .then(() => {
      global.db.ChatModel.httpGet(req, res)
    })
    .catch(res.catchError)
  }

  /**
   * @apiVersion 1.0.0
   * @api {delete} /api/v1/chat/:id Delete conversation
   * @apiName view
   * @apiGroup Chat
   * @apiPermission Authorization
   * @apiDescription Delete conversation
   *
   * @apiParam {string} id Mail unique ID.
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : { }
   *     }
   *
   * @apiUse Errors
   */
  deleteMessage (req, res) {
    const { user: { _id: userId}, params: {id}, body: {message: messageId} } = req
    global.db.ChatModel.findById(id)
    .then(mail => {
      mail.conversation.map(message => {
        if (message._id == messageId && message.deleted.indexOf(userId) < 0) {
          message.deleted.push(userId)
        }
      })
      return mail.save()
    })
    .then(() => {
      global.db.ChatModel.httpGet(req, res)
    })
    .catch(res.catchError)
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/chat/:id/reply Reply conversation
   * @apiName reply
   * @apiGroup Chat
   * @apiPermission Authorization
   * @apiDescription Reply conversation
   *
   * @apiParam {string} id Mail unique ID.
   * @apiParam {String} message mail text
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : { }
   *     }
   *
   * @apiUse Errors
   */
  reply (req, res) {
    const { user: { _id: userId}, params: {id}, body } = req

    return global.db.ChatModel.findOne({_id: id})
      .then(mail => {
        if (!mail) {
          return res.notFound({message: 'Conversation not found!'})
        }

        if (!mail.conversation) {
          mail.conversation = []
        }

        let message = {
          message: body.message,
          fromUser: userId
        }

        if (body.attachment) {
          message.attachment = body.attachment
        }

        // mail.state = "unread"

        const toUser = userId.toString() == mail.fromUser.toString() ? mail.toUser.toString() : mail.fromUser.toString()

        const index = mail.unread.indexOf(toUser)
        if (index < 0) {
          mail.unread.push(toUser)
        }

        mail.conversation.push(message)

        global.sendSocketMailToUser(mail, toUser)

        return mail.save()
      })
      .then((result) => {
        res.ok(result)
      })
      .catch((err) => {
        return res.badRequest(err.message)
      })
  }

}

module.exports = ChatController
