'use strict'

var config = require('app/config')
var pkg = require('../../package.json')

var logging = require('@google-cloud/logging')({
  projectId: config.google.projectId,
  credentials: config.google.credentials
})

/**
 * Report an error to StackDriver Error Reporting. Writes up to the maximum data
 * accepted by StackDriver Error Reporting.
 *
 * @param {Error} err The Error object to report.
 * @param {Object} [req] Request context, if any.
 * @param {Object} [res] Response context, if any.
 * @param {Object} [options] Additional context, if any.
 * @param {Function} callback Callback function.
 */
function reportDetailedError (err, req, res, options = {}) {
  return new Promise((resolve, reject) => {
    var NODE_ENV = process.env.NODE_ENV
    var log = logging.log('errors')

    // MonitoredResource
    // See https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
    var resource = {
        // MonitoredResource.type
      type: 'global'
      // MonitoredResource.labels
      // labels: {
      //   function_name: NODE_ENV
      // }
    }

    var context = {
      severity: 500
    }
    if (options.user !== undefined) {
      // ErrorEvent.context.user
      context.user = options.user
    } else if (req && req.user) {
      context.user = {
        userEmail: req.user.email,
        userId: req.user._id.toString()
      }
    }

    if (req && res) {
      // ErrorEvent.context.httpRequest
      context.httpRequest = {
        method: req.method,
        url: req.originalUrl,
        userAgent: typeof req.get === 'function' ? req.get('user-agent') : 'unknown',
        referrer: '',
        remoteIp: req.ip,
        body: req.body,
        params: req.params,
        query: req.params
      }
      if (typeof res.statusCode === 'number') {
        context.httpRequest.responseStatusCode = res.statusCode
      }
      if (req.body) {
        context.httpRequest.body = req.body
        context.httpRequest.params = req.params
        context.httpRequest.query = req.params
      }
    }
    if (!(err instanceof Error) || typeof err.stack !== 'string') {
      // ErrorEvent.context.reportLocation
      context.reportLocation = {
        filePath: typeof options.filePath === 'string' ? options.filePath : 'unknown',
        lineNumber: typeof options.lineNumber === 'number' ? options.lineNumber : 0,
        functionName: typeof options.functionName === 'string' ? options.functionName : 'unknown'
      }
    }

    try {
      if (options.version === undefined) {
        options.version = pkg.version
      }
    } catch (err) {
      reject(err)
    }
    if (options.version === undefined) {
      options.version = 'unknown'
    }

    // ErrorEvent
    // See https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
    var structPayload = {
      // ErrorEvent.serviceContext
      serviceContext: {
        // ErrorEvent.serviceContext.service
        service: 'lambda:' + NODE_ENV,
        // ErrorEvent.serviceContext.version
        version: '' + options.version
      },
      // ErrorEvent.context
      context: context
    }

    // ErrorEvent.message
    if (err instanceof Error && typeof err.stack === 'string') {
      structPayload.message = err.stack
    } else if (typeof err === 'string') {
      structPayload.message = err
    } else if (typeof err.message === 'string') {
      structPayload.message = err.message
    }

    var metadata = {resource}

    var entry = log.entry(metadata, structPayload)

    // const entry = log.entry(resource, structPayload);
    log.error(entry, (err, data) => {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  })
}
// [END helloHttpError]

module.exports = reportDetailedError
