'use strict'

const R = require('ramda')
const Agenda = require('agenda')
const urlencode = require('urlencode')
// const config = require('app/config')
const Jobs = require('./jobs')

const worker = new Agenda({
  // db: { address: config.database.connection } // getting error
  db: { address: `mongodb://bookingbravo:${urlencode('V0bi!qwerty1$')}@db.vobi.io/booking` }
})

const defineJob =
  def => worker.define(
    def.name,
    def.options || {},
    (job, done) => {
      def
        .job(R.pathOr({}, ['attrs', 'data'], job))
        .then(() => done())
        .catch(err => done(err))
    }
  )

Jobs
  .map(Job => Job({ worker }))
  .map(defineJob)

module.exports = worker
