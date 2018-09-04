/* eslint camelcase:0 */
'use strict'
// var EventRepository = require('./eventRepository')
var Utils = require('../../utils/Utils')
var Promise = require('bluebird')
const roles = require('../roles/roles').roles

class EventController {
  constructor ({eventRepository}) {
    this.eventRepository = eventRepository
  }

   /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/event Create event
   * @apiName CreateEvent
   * @apiGroup Event
   * @apiPermission Authorization
   * @apiDescription Create event
   *
   * @apiUse EventModel
   *
   * @apiUse defaultSuccessExample201
   * @apiUse Errors
   */
  createEvent (req, res) {
    let options = {}
    global.db.EventModel.httpPost(req, res, options)
  }

  /**
   * @apiVersion 1.0.0
   * @api {put} /api/v1/event/:id Edit Event
   * @apiName EditEvent
   * @apiGroup Event
   * @apiPermission Authorization
   * @apiDescription Edit Event data
   *
   * @apiParam {string} id Event unique ID.
   * @apiUse EventModel
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  editEvent (req, res) {
    let options = {}
    global.db.EventModel.httpPut(req, res, options)
  }

  /**
   * @apiVersion 1.0.0
   * @api {delete} /api/v1/event/:id Delete Event
   * @apiName DeleteEvent
   * @apiGroup Event
   * @apiPermission Authorization
   * @apiDescription Delete Event from project.
   *
   * @apiParam {string} id Event unique ID.
   * @apiUse EventModelSuccess
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  deleteEvent (req, res) {
    let options = {}
    // const {_id: userId} = req.user
    req.body.status = 'deleted'
    global.db.EventModel.httpPut(req, res, options)
  }

  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/event?pageSize=:pageSize&page=:page&sort=:sort&select=:select&where=:where&populate=:populate Get Task List by User
   * @apiName getEventList
   * @apiGroup Event
   * @apiPermission Authorization
   * @apiDescription Get Event list by User
   *
   * @apiUse defaultQueryParams
   *
   * @apiUse defaultSuccessExample200
   * @apiUse Errors
   */
  listEvent (req, res) {
    let where = {
      user: req.user._id,
      status: {$ne: 'deleted'}
    }
    const options = {where}
    global.db.EventModel.httpGet(req, res, options)
  }

}

module.exports = EventController
