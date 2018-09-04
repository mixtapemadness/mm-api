const baseModelPlugin = require('../core/baseModelPlugin')

module.exports = (mongoose) => {
  const Schema = mongoose.Schema

  const invitationSchema = new Schema({
    creator: { type: Schema.Types.ObjectId },
    createdOn: { type: Date, default: Date.now },
    modifier: { type: Schema.Types.ObjectId },
    modifiedOn: { type: Date },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
    state: {
      type: String,
      default: 'unread',
      required: true,
      enum: ['unread', 'read']
    },
    status: {
      type: String,
      default: 'requested',
      required: true,
      enum: ['requested', 'canceled', 'accepted', 'declined'],
      index: 1
    }
  }, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  })

  invitationSchema.plugin(baseModelPlugin)

  invitationSchema.pre('save', function (next) {
    this.modifiedOn = Date.now()
    next()
  })

  invitationSchema.methods.toJSON = function () {
    const obj = this.toObject()

    delete obj.__v
    delete obj._id

    return obj
  }

  return mongoose.model('Invitation', invitationSchema)
}
