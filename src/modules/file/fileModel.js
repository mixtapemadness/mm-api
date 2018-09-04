/* eslint no-useless-escape:0 */
/* eslint handle-callback-err:0 */

module.exports = (mongoose) => {
  const Schema = mongoose.Schema

  const fileSchema = new Schema({
    filename: String,
    mimetype: String,
    encoding: String,

    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    createdOn: { type: Date, default: Date.now }
  }, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    setDefaultsOnInsert: true
  })

  return mongoose.model('files', fileSchema)
}
