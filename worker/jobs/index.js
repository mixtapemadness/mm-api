'use strict'

const fs = require('fs')
const path = require('path')

const jobs = fs
  .readdirSync(__dirname)
  .filter(filename =>
    ![
      'index.js',
      'constants.js',
      'routes.js'
    ].includes(filename) &&
    filename.includes('.js')
  )
  .map(filename => require(path.join(__dirname, filename)))

module.exports = jobs
