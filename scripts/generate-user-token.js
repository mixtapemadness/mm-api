'use strict'

const appConfig = require('app/config')
const jwtService = require('../app/services/jwtService')

const token = jwtService(appConfig.jwt)
  .sign({ id: process.argv[2] })

console.log(token)
