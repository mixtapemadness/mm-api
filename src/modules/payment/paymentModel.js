'use strict'

const types = ['deposit', 'serviceFee', 'agentFee', 'basic']
const statuses = ['PENDING', 'CREATED', 'COMPLETED']

module.exports = (mongoose) => {
  let Schema = mongoose.Schema

  let paymentSchema = new Schema({
    payKey: { type: String },
    invoiceId: { type: String },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: 1
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'Receiver',
      index: 1
    },
    amount: { type: Number },
    currencyCode: { type: String, default: 'USD' },
    type: {
      type: String,
      required: true,
      enum: types,
      default: 'basic',
      index: 1
    },
    status: {
      type: String,
      required: true,
      enum: statuses,
      index: 1
    },
    description: { type: String, required: false },

    paypalPaymentDetails: {
      type: Object,
      required: false
    },

    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    createdOn: { type: Date, default: Date.now, index: 1 },
    modifier: { type: Schema.Types.ObjectId, ref: 'User' },
    modifiedOn: { type: Date }
  }, {})

  paymentSchema.methods.toJSON = function () {
    var obj = this.toObject()
    delete obj.__v
    delete obj._id

    return obj
  }

  return mongoose.model('Payment', paymentSchema)
}
