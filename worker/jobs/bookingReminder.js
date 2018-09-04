'use strict'

const axios = require('axios')

const { bookingReminderUrl } = require('./routes')
const getToken = require('../getToken')

const {
  BOOKING_REMINDER
} = require('./constants')

module.exports = () => ({
  name: BOOKING_REMINDER,
  job: () =>
    axios.get(bookingReminderUrl, {
      params: {
        token: getToken()
      }
    })
})
