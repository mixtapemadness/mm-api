'use strict'
const request = require('request-promise-native')
const MAILCHIMP_API_KEY = '1653629bf3451d835462f6246ee7082b-us18'
const MAILCHIMP_INSTANCE = 'us18'
const MAILCHIMP_LIST_ID = '167380d875'

class MailChimpRepository {
  constructor(wp) {
    this.wp = wp
  }

  async Subscribe(args) {
    console.log('args', args)
    return new Promise((resolve, reject) => {
      const Item = {
        ...args
      }
      const data = {
        email_address: args.email_address,
        status: 'subscribed'
      }
      const options = {
        json: data,
        headers: {
          Authorization:
            'Basic ' +
            new Buffer('anystring' + ':' + MAILCHIMP_API_KEY).toString(
              'base64'
            )
        },
        method: 'POST',
        uri:
          'https://' +
          MAILCHIMP_INSTANCE +
          '.api.mailchimp.com/3.0/lists/' +
          MAILCHIMP_LIST_ID +
          '/members/'
      }
      request(options)
        .then(data => {
          return resolve(Item)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }

}

module.exports = MailChimpRepository

