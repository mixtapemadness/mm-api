var baseModelPlugin = require('../core/baseModelPlugin')

module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let chatSchema = new Schema({
    state: { type: String,
      default: 'unread',
      required: true,
      enum: ['unread', 'read'],
      index: 1
    },

    fromUser: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    toUser: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    bookingId: {type: Schema.Types.ObjectId, ref: 'Booking'},

    // members : [
    //   {type: Schema.Types.ObjectId, ref: 'User'}
    // ],

    subject: { type: String, required: true },

    // conversation: [
    //   {
    //     message: {type: String, required: false},
    //     fromUser: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    //     attachment: {type: Schema.Types.ObjectId, ref: 'Attachment'},
    //     deleted: [ {type: Schema.Types.ObjectId, ref: 'User'} ],
    //     sendAt: {type: Date, default: new Date()},
    //     state: { type: String, default: 'unread', required: true, enum: ['unread', 'read'], index: 1 }
    //   }
    // ],

    unread: { type: [ {type: Schema.Types.ObjectId, ref: 'User'} ], index: true },
    archievedByFromUser: {type: Boolean, default: false},
    archievedByToUser: {type: Boolean, default: false},
    sentByAdmin: {type: Boolean, default: false},

    modifierUser: {type: Schema.Types.ObjectId, ref: 'User'},
    created: {type: Date, default: Date.now, index: 1},
    modified: {type: Date}
  }, {
    usePushEach: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  })

  chatSchema.pre('save', (next) => {
    this.modified = Date.now()
    next()
  })

  chatSchema.plugin(baseModelPlugin)

  // chatSchema.index({'_id': 1})

  chatSchema.methods.toJSON = function() {
    var obj = this.toObject()
    delete obj.__v
    // delete obj._id

    return obj
  }

  // chatSchema.index({status: 1, owner: 1, state: 1})
  // chatSchema.index({team: 1, company: 1})
  // chatSchema.index({team: 1, company: 1, owner: 1})
  // chatSchema.index({team: 1, company: 1})

  return mongoose.model('Chat', chatSchema)
}
