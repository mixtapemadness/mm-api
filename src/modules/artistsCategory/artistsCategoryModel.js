// var baseModelPlugin = require('../core/baseModelPlugin')

module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let artistCategorySchema = new Schema({
    artist_catid: Number,
    artist_catname: String,
    is_active: Number
  })

  return mongoose.model('artistCategory', artistCategorySchema)
}
