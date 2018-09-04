
module.exports = {
  port: 8001,
  HTTP_HOST: 'https://api.bookingbravo.com',
  database: {
    // connection: 'mongodb://user:password@52.39.18.220:27017/walkthru'
    connection: 'mongodb://vobi:bookingbrav01!@bookingbravo.com/booking'
  },
  paypal: {
    returnUrl: 'http://api.bookingbravo.com/api/v1/payments/transaction',
    cancelUrl: 'http://api.bookingbravo.com/api/v1/payments/transaction'
  },
  mailgun: {
    apiKey: 'key-',
    domainForMailgun: 'bookingbravo.com',
    defaultFrom: 'service@bookingbravo.com',
    domainInTemplate: '',
    frontendUrl: ''
  },
  systemEmail: 'service@bookingbravo.com',
  front_url: 'https://bookingbravo.com',
  back_url: 'https://api.bookingbravo.com'
}

