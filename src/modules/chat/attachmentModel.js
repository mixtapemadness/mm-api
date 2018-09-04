var baseModelPlugin = require('../core/baseModelPlugin')

module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let attachmentSchema = new Schema({

    filename: { type: String, required: true },
    originalname: { type: String, required: true },
    extension: { type: String, required: true },
    mimetype: { type: String },
    size: { type: String, required: true },

    modifierUser: {type: Schema.Types.ObjectId, ref: 'User'},
    created: {type: Date, default: Date.now},
    modified: {type: Date}
  }, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  })

  attachmentSchema.plugin(baseModelPlugin)

  attachmentSchema.pre('save', (next) => {
    this.modified = Date.now()
    next()
  })

  attachmentSchema.methods.toJSON = function() {
    var obj = this.toObject()
    delete obj.__v
    delete obj._id

    return obj
  }

  attachmentSchema.index({status: 1, owner: 1, state: 1})
  attachmentSchema.index({team: 1, company: 1})
  attachmentSchema.index({team: 1, company: 1, owner: 1})
  attachmentSchema.index({team: 1, company: 1})

  return mongoose.model('Attachment', attachmentSchema)
}
