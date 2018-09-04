// admin user db.createUser({user: "easyshair",pwd: "adminpass",roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]})
module.exports = {
  port: 8001,
  HTTP_HOST: 'https://apidev.bookingbravo.com', // this is api endpoint full url
  database: {
    // connection: 'mongodb://vobi:bookingbrav01!@bookingbravo.com/booking'
    connection : 'mongodb://bookingbravo:V0bi!qwerty1$@db.vobi.io/booking'
  },
  mailgun: {
    apiKey: 'key-',
    domainForMailgun: 'test.bookingbravo.com',
    defaultFrom: 'service@test.bookingbravo.com',
    domainInTemplate: 'https://test.bookingbravo.com',
    frontendUrl: 'https://test.bookingbravo.com'
  },
  systemEmail: 'service@bookingbravo.com',
  front_url: 'https://test.bookingbravo.com',
  back_url: 'https://apidev.bookingbravo.com'
}
