
module.exports = {
  port: 8001,
  HTTP_HOST: 'http://localhost:8001',
  database: {
    // connection: 'mongodb://localhost:27017/booking'
    connection: 'mongodb://bookingbravo:V0bi!qwerty1$@db.vobi.io/booking'
  },
  paypal: {
    returnUrl: 'http://localhost:8001/api/v1/payments/transaction',
    cancelUrl: 'http://localhost:8001/api/v1/payments/transaction'
  },
  mailgun: {
    apiKey: 'key-3e652d629b8d9177f917a49ca5ff1205',
    domainForMailgun: 'test.bookingbravo.com',
    defaultFrom: 'service@test.bookingbravo.com',
    domainInTemplate: 'https://test.bookingbravo.com',
    frontendUrl: 'https://test.bookingbravo.com'
  },
  systemEmail: 'service@test.bookingbravo.com',
  stripeKey: 'sk_test_Dhb6ICQkc3hWBCaF1C5IPAI9',
  front_url: 'http://localhost:9000',
  back_url: 'http://localhost:8001'
}
