
module.exports = {
  port: 8003,
  HTTP_HOST: 'http://localhost:8001',
  database: {
    connection: 'mongodb://localhost:27017/booking'
  },
  mailgun: {
    apiKey: 'key-3e652d629b8d9177f917a49ca5ff1205',
    domainForMailgun: 'mixtape.com',
    defaultFrom: 'service@mixtape.com',
    domainInTemplate: 'https://mixtape.com',
    frontendUrl: 'https://mixtape.com'
  },
  systemEmail: 'service@mixtape.com',
  stripeKey: 'sk_test_Dhb6ICQkc3hWBCaF1C5IPAI9',
  front_url: 'https://mixtape.com',
  back_url: 'https://apidev.mixtape.com'
}
