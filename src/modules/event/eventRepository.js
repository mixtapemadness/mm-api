/* eslint handle-callback-err:0 */
'use strict'

// var roles = require('../roles/roles').roles
// var Utils = require('../../utils/Utils')
// var Promise = require('bluebird')
// var config = require('app/config')

class eventRepository {
  constructor ({ db, fileRepository }) {
    this.db = db
    this.fileRepository = fileRepository
  }

  createEvent () {

  }

  updateEvent () {

  }

  async removeFilesOfEvent ({ _id }) {
    const event = await this.db.EventModel.findOne({ _id })

    if (event && event.urls) {
      event.urls.forEach(item => this.fileRepository.removeFile({ filename: item.url }))
    }
  }

  async getEvents (args, user) {
    const pick = require('lodash/pick')

    const preparedArgs = pick(args, ['type'])

    if (args.users && args.users.length) {
      preparedArgs.user = { $in: [
        ...args.users
      ]}
    }

    return await global.db.EventModel.find(preparedArgs)
  }
}

module.exports = eventRepository

