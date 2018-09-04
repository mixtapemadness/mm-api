/* eslint handle-callback-err:0 */
'use strict'
var Promise = require('bluebird')
var config = require('app/config')
var twilio = require('twilio')
var debug = require('debug')('mixtape:helper')

class HelperRepo {

  constructor (db) {
    this.db = db
  }

  async uploadPropertyPhoto (id, leaseId, filename) {
    return global.db.TenantModel.findOne({_id: id})
.then(tenant => {
  console.log(id)
  if (!tenant) {
    return Promise.reject({message: 'data not found!'})
  }
  const leases = tenant.lease.map(item => {
    if (item._id.toString() === leaseId) {
      item.photo = filename
    }
    return item
  })
  tenant.lease = leases
  return tenant.save()
}).then(tenant => Promise.resolve(tenant))
  }

  sendSmsWithTwillio (text, to) {
    // debug('twilio : =>>>', config.twilio.accountSid)
    var client = new twilio(config.twilio.accountSid, config.twilio.authToken)
    return client.messages.create({
      body: text,
      to,  // Text to this number
      from: config.twilio.defaultPhoneNumber // From a valid Twilio number
    }).then((message) => {
      return message.sid
    }).catch((err) => {
      debug('Twillio create err catch : ', err)
      return err.message
    })
  }

}

module.exports = HelperRepo

