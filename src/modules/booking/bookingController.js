'use strict'

const mailService = require('app/services/sendgrid/sendgridSevice')
const getToken = require('../../../worker/getToken')

class BookingController {
  constructor({ db, bookingRepository }) {
    this.db = db
    this.bookingRepository = bookingRepository
  }

  tokenAuth(req, res, next) {
    console.log(req.query.token, getToken())
    req.query.token === getToken() ? next() : res.end('nope')
  }

  async boookingPaymentReminder(req, res) {
    const fiveDaysForward = new Date()
    fiveDaysForward.setDate(fiveDaysForward.getDate() + 5)

    const oneDay = new Date()
    oneDay.setDate(oneDay.getDate() - 1)

    const bookings = await this.db.BookingModel.find({
      status: 'booked',
      modifiedOn: { $lte: oneDay },
      endDate: { $gte: new Date() }
    })

    bookings.forEach(booking =>
      this.db.PaymentModel.aggregate([
        { $match: { bookingId: booking._id } },
        { $group: { _id: null, amount: { $sum: '$amount' } } }
      ])
        .then(sum => {
          const amount = sum[0] && sum[0].amount ? sum[0].amount : 0

          if (booking.fee > amount) {
            return this.db.UserModel.findOne({ _id: booking.bookerId })
              .then(booker =>
                mailService.send({
                  templateName: 'bookingPaymentReminder',
                  templateData: {
                    booker,
                    booking,
                    remaining: booking.fee - amount
                  },
                  to: booker.email,
                  subject: 'You have incomplete payment on a booking'
                })
              )
          }

          return Promise.resolve()
        })
        .catch(e => console.error(e.message))
    )

    res.end('done')
  }
}

module.exports = BookingController
