// admin user db.createUser({user: "easyshair",pwd: "adminpass",roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]})
module.exports = {
  port: 8001,
  HTTP_HOST: 'https://apidev.mixtape.com', // this is api endpoint full url
  database: {
    // connection: 'mongodb://vobi:bookingbrav01!@mixtape.com/booking'
    connection : 'mongodb://mixtape:V0bi!qwerty1$@db.vobi.io/booking'
  },
  mailgun: {
    apiKey: 'key-',
    domainForMailgun: 'test.mixtape.com',
    defaultFrom: 'service@test.mixtape.com',
    domainInTemplate: 'https://test.mixtape.com',
    frontendUrl: 'https://test.mixtape.com'
  },
  systemEmail: 'service@mixtape.com',
  front_url: 'https://test.mixtape.com',
  back_url: 'https://apidev.mixtape.com'
}
