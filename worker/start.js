'use strict'

const {
  BOOKING_REMINDER
} = require('./jobs/constants')
const worker = require('.')

// connect to db

const exitGracefuly = () =>
  worker.stop(() => process.exit(0))

const startWorker = () => {
  worker.every(
    '1 day',
    BOOKING_REMINDER
  )

  worker.start()
}

// listen to ready event to start the worker
worker.on(
  'ready',
  startWorker
)

// listen to job events and log into console
worker.on(
  'start',
  job => console.log(`${new Date()} Job '${job.attrs.name}' is starting`)
)
worker.on(
  'success',
  job => console.log(`${new Date()} Job '${job.attrs.name}' succesfully finished`)
)
worker.on(
  'fail',
  (err, job) => console.log(`${new Date()} Job '${job.attrs.name}' failed with error: ${err}`)
)

// setup gracefull exit
process.on(
  'SIGTERM',
  exitGracefuly
)
process.on(
  'SIGINT',
  exitGracefuly
)
