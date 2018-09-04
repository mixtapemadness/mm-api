/* eslint camelcase:0 */
'use strict'
// var debug = require('debug')('vobi')
var Utils = require('../../utils/Utils')
var rl = require('../roles/roles')
var config = require('app/config')
var debug = require('debug')('mixtape:helper')

class HelperController {

  constructor ({ db, helperRepository }) {
    this.db = db
    this.helperRepo = helperRepository
  }

  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/helpers/ping  test route ping helper routes
   * @apiName Ping
   * @apiGroup Helpers
   * @apiPermission Public
   * @apiDescription Ping helper routes
   *
   *
   * @apiUse defaultSuccessExample201
   * @apiUse Errors
  */
  ping (req, res) {
    res.ok('ping helpers ok')
  }

  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/helpers/roles role list
   * @apiName get role list
   * @apiGroup Helpers
   * @apiDescription get role list
   *
   *
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  getRoles (req, res) {
    const list = [
      {name: rl.roles.admin}, {name: rl.roles.badgeAdministrator}, { name: rl.roles.entranceScanner}]
    return res.ok(list)
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/helpers/send-sms?key=:key send sms text message to user
   * @apiName send text message to user
   * @apiGroup Helpers
   * @apiDescription send text messages
   *
   * @apiParam {String} [key] You need secret key to execute this endpoin
   * @apiParam {string} to phone number.
   * @apiParam {string} text message body.
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  sendSms (req, res) {
    const { key } = req.query
    const { text, to } = req.body

    if (key !== config.cronSecretKey) {
      return res.badRequest({ message: `Sorry your secret key is not correct I can't send text message :) ` })
    }
    // validate text message
    if ((!text || text.length < 2)) {
      return res.badRequest({message: 'Please provide valid text message'})
    }
    // validate phone number
    if ((!to || to.length < 4)) {
      return res.badRequest({message: 'Please provide valid phone number'})
    }

    return this.helperRepo.sendSmsWithTwillio(text, to)
      .then((data) => {
        res.ok(data)
      }).catch((err) => {
        debug('send sms err : ', err)
        return res.catchError({ message: err })
      })
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/helpers/upload-image image upload to server
   * @apiName post image to server
   * @apiGroup Helpers
   * @apiDescription Image Uploading
   *
   * @apiParam {file} image.
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  async uploadImage (req, res) {
    var userId = String(req.user.id)
    const {type} = req.query
    Utils.extractFiles(req, res, 'image', userId)
    .then((data) => {
      const {type} = req.query
      const {comment} = req.body
      let response = null

      // NOTE: here extract files returns images

      var image = ''
      image = process.env.NODE_ENV === 'development'
      ? `${req.protocol}://${req.hostname}:${config.port}/uploads/images/${userId}/${data[0].filename}`
      : `${req.protocol}://${req.hostname}/uploads/images/${userId}/${data[0].filename}`

      res.ok({ image, filename: data[0].filename })
    })
  }
}

module.exports = HelperController
