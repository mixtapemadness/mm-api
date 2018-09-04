'use strict'

const eventTypeList = [
  'party',
  'concert',
  'dance',
  'stageShow'
]

const statusList = [
  'request',
  'modified',
  'confirmed',
  'accepted',
  'declined',
  'booked',
  'completed',
  'canceled'
]

module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let bookingSchema = new Schema({
    talentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      description: 'talent to book'
    },
    bookerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: 1
    },
    fee: {
      type: Number,
      default: 0
    },
    depositRequired: {
      type: Number,
      default: 30
    },
    eventType: {
      type: String,
      required: true,
      enum: eventTypeList,
      index: 1
    },
    status: {
      type: String,
      default: 'request',
      required: true,
      enum: statusList,
      index: 1
    },

    text: { type: String },
    location: { type: String },
    startDate: { type: Date, index: 1 },
    endDate: { type: Date, index: 1 },

    bookingInfo: {
      numberOfRooms: { type: Number, default: 0 },
      flightTicket: { type: Number, default: 0 },
      buyReturnTicket: { type: Boolean, default: false },
      isFoodAndBeverages: { type: Boolean },
      foodAndBeverages: { type: String },
      isPromoter: { type: Boolean, default: false },
      isAirportPickupRequired: { type: Boolean, default: false },
      terms: { type: String }
    },

    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    createdOn: { type: Date, default: Date.now },
    modifier: { type: Schema.Types.ObjectId, ref: 'User' },
    modifiedOn: { type: Date }
  }, {})

  bookingSchema.methods.toJSON = function () {
    var obj = this.toObject()
    delete obj.__v
    delete obj._id

    return obj
  }

  bookingSchema.pre('save', function (next) {
    this.modifiedOn = Date.now()

    next()
  })

  return mongoose.model('Booking', bookingSchema)
}
