
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
    domainForMailgun: 'mixtape.com',
    defaultFrom: 'service@mixtape.com',
    domainInTemplate: '',
    frontendUrl: ''
  },
  systemEmail: 'service@mixtape.com',
  front_url: 'https://mixtape.com',
  back_url: 'https://api.mixtape.com'
}

