var ms = require('ms')
var path = require('path')

var rootFolder = path.resolve(__dirname, '..')

module.exports = {
  port: 8001,
  database: {
    connection: 'mongodb://localhost:27017/booking'
  },
  google: {
    mapApiKey: 'AIzaSyAGZlA3uSEzLHmilBA0YHm6PTvmROLMI-M',
    projectId: 'test',
    credentials: {
    }
  },
  twilio: {
    accountSid: '',
    authToken: '',
    defaultPhoneNumber: '+19132465722'
  },
  socket: {
    port: 8002,
    server: 'http://localhost:8002/'
  },
  auth: {
    activationTokenExpiresIn: ms('1d'),
    resetPasswordTokenExpiresIn: ms('1d'),
    defaultInvitationPassword: 'qwerty'
  },
  upload: {
    dir: `${rootFolder}/public/uploads/`,
    maxFieldSize: 20000000 // 20 MB
    // maxFileSize: ,
    // maxFiles
  },
  jwt: {
    secret: 'THISISSECRET',
    algorithm: 'HS256',
    issuer: 'vobi',
    audience: 'vobi',
    expiresIn: ms('1d'),
    ignoreExpiration: '',
    subject: ''
  },
  cronSecretKey: 'artqvaradzmurad',
  activityLogKey: 'artqvaradzmurad',
  HTTP_HOST: 'http://localhost:8001',
  systemEmail: 'contact@mixtape.com',
  mailgun: {
    apiKey: 'key-414e8b59f8a5af4aa6fe44ce917c8010',
    domainForMailgun: 'mixtape.com',
    // api host
    domainInTemplate: 'http://localhost:8001',
    frontendUrl: 'http://52.40.142.121',
    defaultFrom: 'contact@walkthru.com'
  },
  qrCodes: {
    upload: `${rootFolder}/public/qrcodes/`,
    assetFolder: `/qrcodes/`
  },

  braintree: {
    sandbox: {
      merchantId: 'mvm7rr8b5vyymjzr',
      publicKey: '3d9zgtchb4dshb5g',
      privateKey: '16e8a759c028f4d8dccaad70e20fb9d4'
    },
    production: {
      merchantId: 'mvm7rr8b5vyymjzr',
      publicKey: '3d9zgtchb4dshb5g',
      privateKey: '16e8a759c028f4d8dccaad70e20fb9d4'
    }
  },
  // EC9gdRFX
  // giorgivobi@gmail.com
  paypal: {
    rest: {
      sandbox: {
        clientId: 'Ae-gDqXjlWLHDVB9I7a2jSMkzDonsfomRqvOp0pUKASFFOjF4zTQeXXGQMXGQxIaUgLuJEoPoBPwg_KL',
        secret: 'ELRBlYD7QgPZ03rZry7GgTWdaCsHtcjXnp88Mi-ihqeXRJrkCcKXhJ5EGYFOetZkPkhIjvRQejUNRGbM'
      }
    },
    sandbox: {
      url: 'https://svcs.sandbox.paypal.com/AdaptivePayments/',
      appId: 'APP-80W284485P519543T',
      userId: 'giorgivobi_api1.gmail.com',
      username: 'giorgivobi_api1.gmail.com',
      password: 'WEJHHSFR7AK2PWT9',
      signature: 'AjODVAIUQ1zP4DSt2L2f1d3Wj.aPAcPzZv6kq8UAzoPyneM2sk0Qa2a-',
      requestFormat: 'JSON',
      responseFormat: 'JSON',
      primaryReceiver: {
        email: 'giorgivobi@gmail.com'
      }
    }
  },

  deployment: {
    dev: {
      host: 'ec2-34-209-156-162.us-west-2.compute.amazonaws.com',
      username: 'ubuntu'
    },
    test: {
      host: 'ec2-34-209-156-162.us-west-2.compute.amazonaws.com',
      username: 'ubuntu'
    },
    prod: {
      host: '',
      username: 'ubuntu'
    }
  }
  // cronjobKey : 'vinc!ncGamax!losAm0wydesErtDges'

}

