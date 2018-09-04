var ActivityLogCtrl = require('./activityController')
var hasActivitLogToken = require('../../policies/activityLogPolice')

module.exports = {
  '/api/v1/activity-log': {
    '/ping': {
      get: [hasActivitLogToken, ActivityLogCtrl.ping.bind(ActivityLogCtrl)]
    },
    '/create': {
      post: [hasActivitLogToken, ActivityLogCtrl.create.bind(ActivityLogCtrl)]
    },
    '/get-by-key/:key': {
      get: [hasActivitLogToken, ActivityLogCtrl.getByKey.bind(ActivityLogCtrl)]
    },
    '/delete-by-ke/:key': {
      delete: [hasActivitLogToken, ActivityLogCtrl.deleteByKey.bind(ActivityLogCtrl)]
    }
  }
}
