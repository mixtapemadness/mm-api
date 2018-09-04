'use strict'

class NotificationController {
  constructor ({ db, notificationRepository }) {
    this.db = db
    this.notificationRepository = notificationRepository
  }
  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/notifications Create Notification
   * @apiName CreateNotification
   * @apiGroup Notification
   * @apiPermission Authorization
   * @apiDescription Create Notification data
   *
   * @apiParam {String} title title of the Notification.
   * @apiParam {String} message message of the Notification.
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  createNotification (req, res) {
    req.body.assignmentDate = Date.now()
    global.db.NotificationModel.httpPost(req, res)
  }

  /**
   * @apiVersion 1.0.0
   * @api {put} /api/v1/notifications/:id Edit Notification
   * @apiName EditNotification
   * @apiGroup Notification
   * @apiPermission Authorization
   * @apiDescription Edit Notification data
   *
   * @apiParam {string} id Notification unique ID.
   * @apiParam {String} title notitication title.
   * @apiParam {String} message notitication message.
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  editNotification (req, res) {
    global.db.NotificationModel.httpPut(req, res)
  }

  /**
   * @apiVersion 1.0.0
   * @api {delete} /api/v1/notifications/:id Delete Notification
   * @apiName DeleteNotification
   * @apiGroup Notification
   * @apiPermission Authorization
   * @apiDescription Delete Notification from project.
   *
   * @apiParam {string} id Notification unique ID.
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  deleteNotification (req, res) {
    global.db.NotificationModel.httpDelete(req, res)
  }

  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/notifications?pageSize=:pageSize&page=:page&sort=:sort&select=:select&where=:where&populate=:populate Get Notification List by User
   * @apiName getNotificationsList
   * @apiGroup Notification
   * @apiPermission Authorization
   * @apiDescription Get Notifications list by User
   *
   * @apiUse defaultQueryParams
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  listNotifications (req, res) {
    const { _id: userId } = req.user
    const options = {
      where: {
        owner: userId,
        status: { $ne: 'deleted' }
      }
    }
    global.db.NotificationModel.httpGet(req, res, options)
  }

  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/notifications/:id Get Notification By Id
   * @apiName getNotificationById
   * @apiGroup Notification
   * @apiPermission Authorization
   * @apiDescription Get Notification By Id
   *
   *
   * @apiParam {string} id Notification unique ID.
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  getNotification (req, res) {
    const { company: { _id: companyId } } = req.user
    const options = {
      where: {
        company: companyId,
        status: { $ne: 'deleted' }
      }
    }
    global.db.NotificationModel.httpGet(req, res, options)
  }

  /**
 * @apiVersion 1.0.0
 * @api {put} /api/v1/tasks/:id/close Close Task
 * @apiName CloseTaks
 * @apiGroup Notification
 * @apiPermission Authorization
 * @apiDescription Close task
 *
 * @apiParam {string} id Task unique ID.
 *
 * @apiUse defaultSuccessExample200
 * @apiUse Errors
 */
  setReadStatus (req, res) {
    const { ids } = req.body
    global.db.NotificationModel.find({ _id: { $in: ids } })
      .then(notifications => {
        const promises = notifications.map(item => {
          item.state = 'read'
          return item.save()
        })

        return Promise.resolve(promises)
      })
      .then(() => {
        res.ok('done')
      })
      .catch(res.catchError)
  }

  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/notifications/count Count unread notifications
   * @apiName countUnreadNotifications
   * @apiGroup Notification
   * @apiPermission Authorization
   * @apiDescription Count unread notifications
   *
   * @apiUse defaultQueryParams
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  countUnreadNotifications (req, res) {
    const { user } = req
    global.db.NotificationModel.count({ owner: user.id, state: 'unread' })
      .then(data => {
        res.ok(data || 0)
      })
      .catch(res.catchError)
  }
}

module.exports = NotificationController
