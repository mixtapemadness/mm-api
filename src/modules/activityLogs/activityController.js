/* eslint camelcase:0 */
'use strict'
var ActivityLogRepository = require('./activityLogRepository')
var Utils = require('../../utils/Utils')
var Promise = require('bluebird')

class ActivityLogController {
  constructor (activityLogRepo) {
    this.activityLogRepository = activityLogRepo
  }

   /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/activity-log/ping ping
   * @apiName Ping
   * @apiGroup Activity Log
   * @apiDescription just ping is it work or not activity Log Repo
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  ping (req, res) {
    res.ok('ping activity log controller it works!!!')
  }
   /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/activity-log/create creates activity log
   * @apiName Save Activity Log
   * @apiGroup Activity Log
   * @apiDescription Save Input Object to Activity Log
   *
   * @apiUse ActivityLogModel
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  create (req, res) {
    const data = req.body
    const reqUserId = req.user ? req.user.id : null
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

    return this.activityLogRepository.create(data, reqUserId, ip)
    .then((log) => {
      res.ok(log)
    })
    .catch((err) => {
      res.badRequest(err)
    })
  }
   /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/activity-log/get-by-key/:key get logs by key
   * @apiName  GetActivity Log by key
   * @apiGroup Activity Log
   * @apiDescription Get Activity By Key
   *
   * @apiParam {string} key
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  getByKey (req, res) {
    const { key } = req.params
    global.db.ActivityLogModel.find({ key: key }).sort({ 'createdAt': -1})
    .then((data) => {
      // NOTE: TODO: append to list activity_started triggered document for tenant
      // TODO: maybe in future we can do it bit different I don't like this code piece
      const tenantEmail = data[0].jsonData.tenantEmail
      return global.db.ActivityLogModel.findOne({ key: tenantEmail, label: 'activity_started' })
        .then((rs) => {
          data.push(rs)
          res.ok(data)
        })
    }).catch((err) => {
      res.badRequest(err)
    })
  }
   /**
   * @apiVersion 1.0.0
   * @api {delete} /api/v1/activity-log/delete-by-key/:key get logs by key
   * @apiName  Delete Activity Log By key
   * @apiGroup Activity Log
   * @apiDescription Delete activity log
   *
   * @apiParam {string} key
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  deleteByKey (req, res) {
    const { key } = req.params
    global.db.ActivityLogModel.remove({ key: key })
    .then((data) => {
      res.ok({ message: 'removed'})
    }).catch((err) => {
      res.badRequest(err)
    })
  }
}

module.exports = new ActivityLogController(new ActivityLogRepository())
