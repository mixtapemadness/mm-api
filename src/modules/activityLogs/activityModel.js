var baseModelPlugin = require('../core/baseModelPlugin')
var Utils = require('../../utils/Utils')

module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let activityLogSchema = new Schema({
    title: { type: String }, // message text
    level: { type: String },  // level is it info, error , log, debug
    label: { type: String },
    appName: { type: String },
    key: { type: String },
    tags: { type: Schema.Types.Mixed },
    jsonData: { type: Schema.Types.Mixed},
    reqUserId: { type: String }, // log requested user Id
    reqUserEmail: { type: String }, // log requested user email
    env: { type: String }, // is it development production or staging
    ip: { type: String },
    location: { type: String }, // NOTE: maybe here object from http://freegeoip.net/json/
    createdClientDate: {type: Date} // client datetimestamp
  }, {
    usePushEach: true
  })

  activityLogSchema.pre('save', (next) => {
    this.modified = Date.now()
    next()
  })

  activityLogSchema.plugin(baseModelPlugin)

  activityLogSchema.virtual('id').get(function() {
    return this._id
  })

  activityLogSchema.methods.toJSON = function() {
    var obj = this.toObject()
    delete obj.__v
    delete obj._id
    return obj
  }

  return mongoose.model('ActivityLog', activityLogSchema)
}

/**
 * @apiDefine ActivityLogModel
 *
 * @apiParam {String} [title] message text
 * @apiParam {String} [level] level is it info, error , log, debug
 * @apiParam {String} [label] label
 * @apiParam {String} [tags] Tags
 * @apiParam {String} [appName] appName
 * @apiParam {String} [key] Key
 * @apiParam {String} [jsonData] object messages this should be json object also.
 *
 */
