'use strict'

module.exports = (mongoose) => {
  const recalculateUserReview = (talentId) => {
    global.db.ReviewModel.aggregate([
      { $match: { talentId } },
      {
        $group: {
          _id: null,
          rating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      },
      { $project: { _id: 0, rating: 1, count: 1 } }
    ])
    .then(([review]) => global.db.UserModel.update({ _id: talentId }, {
      $set: { review }
    }))
    .catch(e => console.error(e))
  }

  let Schema = mongoose.Schema

  let reviewSchema = new Schema({
    talentId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    },
    bookerId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      required: false,
      type: Number
    },
    text: { type: String },

    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    createdOn: { type: Date, default: Date.now },
    modifier: { type: Schema.Types.ObjectId, ref: 'User' },
    modifiedOn: { type: Date }
  }, {})

  reviewSchema.methods.toJSON = function () {
    var obj = this.toObject()
    delete obj.__v
    delete obj._id

    return obj
  }

  reviewSchema.post('save', function (doc) {
    recalculateUserReview(doc.talentId)
  })

  return mongoose.model('Review', reviewSchema)
}
