'use strict'
const request = require('superagent')
const MAILCHIMP_API_KEY = '1653629bf3451d835462f6246ee7082b-us18'
const MAILCHIMP_INSTANCE = 'us18'
const MAILCHIMP_LIST_ID = '167380d875'

class MailChimpRepository {
  constructor(wp) {
    this.wp = wp
  }

  async Subscribe(args) {
    return new Promise((resolve, reject) => {
      const Item = {
        ...args
      }
      const data = {
        email_address: args.email_address,
        status: 'subscribed'
      }

      const url = `https://${MAILCHIMP_INSTANCE}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/`


      request.post(url)
        .set('Content-Type', 'application/json;charset=utf-8')
        .set('Authorization', 'Basic ' + new Buffer('any:' + MAILCHIMP_API_KEY).toString('base64'))
        .send(data)
        .end((err, response) => {
          if (err) {
            return reject(err)
          }

          return resolve(Item)
        })

    })
  }

}

module.exports = MailChimpRepository

