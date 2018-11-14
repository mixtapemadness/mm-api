// var baseModelPlugin = require('../core/baseModelPlugin')

module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let artistDetailsSchema = new Schema({
    artist_id: Number,
    artist_catid: [{ type: Number, ref: 'User' }],
    artist_name: String,
    artist_knownas: String,
    artist_bio: String,
    artist_image: String,
    artist_born: String,
    year_active: Number,
    website: String,
    rating: Number,
    fb_url: String,
    twitter_url: String,
    instagram_url: String,
    youtube: String,
    is_active: Number,
    created_datetime: String,
    old_artist_id: Number
  })

  return mongoose.model('artistDetails', artistDetailsSchema)
}
