var baseModelPlugin = require('../core/baseModelPlugin')

module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let messageScheme = new Schema({
    chatId: {type: Schema.Types.ObjectId, ref: 'Chat', required: true},
    message: {type: String, required: false},
    label: {type: String, default: null},
    fromUser: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    attachment: {type: Schema.Types.ObjectId, ref: 'Attachment'},
    deleted: [ {type: Schema.Types.ObjectId, ref: 'User'} ],
    sendAt: {type: Date, default: new Date(), index: 1},
    state: { type: String, default: 'unread', required: true, enum: ['unread', 'read'], index: 1 }
  }, {
    usePushEach: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  })

  messageScheme.plugin(baseModelPlugin)

  messageScheme.methods.toJSON = function() {
    var obj = this.toObject()
    delete obj.__v
    // delete obj._id

    return obj
  }

  return mongoose.model('Message', messageScheme)
}
