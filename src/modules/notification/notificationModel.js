var baseModelPlugin = require('../core/baseModelPlugin')

module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let notificationSchema = new Schema({
    message: { type: String, required: false },
    state: { type: String, default: 'unread', required: true, enum: ['unread', 'read'], index: 1 },
    actionId: { type: String },
    actionUser: { type: Schema.Types.ObjectId, ref: 'User' },
    actionType: { type: String },
    objectName: { type: String, enum: ['Booking', 'Payment', 'Billing', 'Chat', 'User', 'Event', 'Invitation'] },

    user: { type: Schema.Types.ObjectId, ref: 'User', index: 1 },

    status: { type: String, default: 'confirmed' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    modifierUser: { type: Schema.Types.ObjectId, ref: 'User' },
    created: { type: Date, default: Date.now },
    modified: { type: Date }
  }, {
    // timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  })
  notificationSchema.plugin(baseModelPlugin)

  notificationSchema.pre('save', (next) => {
    this.modified = Date.now()
    next()
  })
  // notificationSchema.index({'_id': 1})

  // delete notifications by team id
  notificationSchema.statics.deleteNotificationsByTeamId = function (teamId) {
    return this.update({ team: teamId, status: { $ne: 'deleted' } }, { status: 'deleted' }, { multi: true, upsert: false })
  }

  notificationSchema.methods.toJSON = function () {
    var obj = this.toObject()
    delete obj.__v
    delete obj._id

    return obj
  }

  notificationSchema.index({ status: 1, owner: 1, state: 1 })

  return mongoose.model('Notification', notificationSchema)
}
