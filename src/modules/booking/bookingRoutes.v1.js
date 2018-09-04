module.exports = ({ ctrl }) => {
  return {
    '/api/v1/bookings': {
      '/booking-reminder': { get: [ctrl.tokenAuth.bind(this), ctrl.boookingPaymentReminder.bind(ctrl)] }
    }
  }
}
