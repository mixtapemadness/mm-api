/* eslint no-tabs: 0 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

var _ = require('lodash')

var envConfig = process.env.CONFIG
	? require('./' + process.env.CONFIG)
	: require('./' + process.env.NODE_ENV)

module.exports = _.merge(require('./default.js'), envConfig)

// No newline at end of file
