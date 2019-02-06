
module.exports = {
  port: 8001,
  HTTP_HOST: 'https://api.mixtape.com',
  database: {
    connection: 'mongodb://localhost:27017/mixtape'
    // connection: 'mongodb://user:password@52.39.18.220:27017/walkthru'
    // connection: 'mongodb://vobi:bookingbrav01!@mixtape.com/mixtape'
  },
  paypal: {
    returnUrl: 'http://api.mixtape.com/api/v1/payments/transaction',
    cancelUrl: 'http://api.mixtape.com/api/v1/payments/transaction'
  },
  mailgun: {
    apiKey: 'key-',
    domainForMailgun: 'mixtapemadness.com',
    defaultFrom: 'info@mixtapemadness.com',
    domainInTemplate: '',
    frontendUrl: ''
  },
  systemEmail: 'info@mixtapemadness.com',
  front_url: 'https://mixtapemadness.com',
  back_url: 'https://api.mixtape.com'
}

