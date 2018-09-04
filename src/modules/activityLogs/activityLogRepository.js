var Utils = require('app/utils/Utils')
var Promise = require('bluebird')
var config = require('app/config')

class ActivityLogRepository {

  create (body, reqUserId, ip, location) {
    let log = new global.db.ActivityLogModel({
      title: body.title || 'Empty message', // TODO: maybe reuquired fields in collection
      level: body.level,
      jsonData: body.jsonData,
      appName: body.appName,
      key: body.key,
      reqUserId: reqUserId || body.reqUserId,
      label: body.label,
      tags: body.tags,
      reqUserEmail: body.reqUserEmail,
      createdClientDate: body.createdClientDate,
      env: body.env,
      ip: ip,
      location: location  // LOCATION : // TODO: maybe here object from http://freegeoip.net/json/
    })

    return log.save().then(data => {
      return data
    }).catch(err => {
      return Promise.reject(err)
    })
  }
  // This method removes activity logs by key
  deleteByKey (key) {
    return global.db.ActivityLogModel.remove({ key: key})
    .then((data) => {
      return data
    }).catch((err) => {
      return err
    })
  }
}

module.exports = ActivityLogRepository
