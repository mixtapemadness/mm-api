/* eslint camelcase:0 */
'use strict'
// var UserRepository = require('./userRepository')
// var AuthRepository = require('./authRepository')

var Utils = require('app/utils/Utils')
// var Promise = require('bluebird')
// var moment = require('moment')
const roles = require('../roles/roles').roles
var config = require('app/config')
var _ = require('lodash')
// const mongoXlsx = require('mongo-xlsx');

class UserController {

  // constructor (userRepository, authRepository) {
  //   this.userRepo = userRepository
  //   this.authRepo = authRepository
  // }

  constructor ({db, userRepository, authRepository}) {
    this.userRepo = userRepository
    this.authRepo = authRepository
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/ping Ping users
   * @apiName Ping
   * @apiGroup User
   * @apiPermission
   * @apiDescription Ping user endpoints
   *
   * @apiUse defaultSuccessExample201
   * @apiUse Errors
   */
  ping (req, res) {
    res.ok('ping user controller')
  }

  checkNoActiveUsers (req, res) {
    const {token} = req.query
    if (token !== config.cronjobKey) {
      return res.badRequest({message: 'You have not permission'})
    }
    return global.db.UserModel.remove({
      'account.active': false,
      createdAt: { $lte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
    })
    .then(result => {
      res.ok(result)
    })
    .catch((err) => {
      return res.badRequest(err)
    })
  }
  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/users?pageSize=:pageSize&page=:page&sort=:sort&select=:select&where=:where&populate=:populate Get user List by User
   * @apiName getUsersList
   * @apiGroup User
   * @apiPermission Authorization
   * @apiDescription Get Users list by User
   *
   * @apiUse defaultQueryParams
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : [User1, User2]
   *     }
   *
   * @apiUse Errors
   */
  listUsers (req, res) {
    const {role} = req.user
    if (!req.user.isSuperAdmin) {
      res.forbidden('You have not permission')
    }

    return global.db.UserModel.find({})
    .then(users => {
      res.ok({ items: users})
    }).catch((err) => {
      return res.badRequest(err)
    })
   // const options = { where: {status: {$ne: 'deleted'} } }
   //  global.db.UserModel.httpGet(req, res, options)
  }

  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/users/:id Get User By Id
   * @apiName getUserById
   * @apiGroup User
   * @apiPermission Authorization (Roles: EAM, Admin, Team Leader)
   * @apiDescription Get User By Id
   *
   * @apiParam {string} id User unique ID.
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : { UserObject }
   *     }
   *
   * @apiUse Errors
   */
  getUser (req, res) {
    const {role} = req.user
    // if(role !== roles.admin && role!== roles.superAdmin){
    //   res.forbidden('You have not permission');
    // }
    const options = {
      where: {status: {$ne: 'deleted'}}
    }
    global.db.UserModel.httpGet(req, res, options)
  }

  /**
   * @apiVersion 1.0.0
   * @api {put} /api/v1/users/:id Edit User
   * @apiName EditUser
   * @apiGroup User
   * @apiPermission Authorization (Roles: EAM, Admin, Team Leader)
   * @apiDescription Edit user data
   *
   * @apiUse UserModel
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : 'User edited'
   *     }
   *
   * @apiUse Errors
   */
  editUser (req, res) {
    const {_id: curentUserId, role} = req.user
    const options = {
      // permission: editPermission
    }
    if (!req.user.isSuperAdmin) {
      return res.forbidden('You have not permission')
    }
    global.db.UserModel.httpPut(req, res, options)
  }

  /**
   * @apiVersion 1.0.0
   * @api {delete} /api/v1/users/:id Delete User
   * @apiName DeleteUser
   * @apiGroup User
   * @apiPermission Authorization (Roles: EAM, Admin, Team Leader)
   * @apiDescription Delete user from User.
   *
   * @apiParam {string} id User unique ID.
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : {
   *          "_id": "4f1d4330-9557-11e6-82f5-4d8d1b1c5c1e",
   *          "status" : 'deleted'
   *        }
   *     }
   *
   * @apiUse Errors
   */
  deleteUser (req, res) {
    const {_id: userId, role} = req.user
    if (role !== roles.admin && role !== roles.superAdmin) {
      res.forbidden('You have not permission')
    }
    const options = {
      // permission: editPermission
    }
    global.db.UserModel.findOne({_id: req.params.id})
     .then((deleteItem) => {
       if (deleteItem.role === roles.superAdmin) {
         return res.forbidden('You have not permission!')
       }

       req.body.email = `delete_${deleteItem._id}@itc.com`
       req.body.status = 'deleted'
       global.db.UserModel.httpPut(req, res, options)
     })
     .catch(res.catchError)
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/:id/upload-avatar Upload avatar
   * @apiName uploadUserAvatar
   * @apiGroup User
   * @apiPermission Authorization
   * @apiDescription Upload user avatar .jpg, .png
   *
   * @apiParam {file} user logo.
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : {}
   *     }
   * @apiUse Errors
   */
  uploadUserAvatar (req, res) {
    Utils.extractFiles(req, res, 'logo')
    .then((data) => {
      req.body = {
        avatar: data[0].filename
      }
      return global.db.UserModel.httpPut(req, res)
    })
    .catch(res.badRequest)
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/upload-avatar Upload current user avatar
   * @apiName uploadCurrentUserAvatar
   * @apiGroup User
   * @apiPermission Authorization (Roles: EAM, Admin)
   * @apiDescription Upload user avatar .jpg, .png
   *
   * @apiParam {file} user avatar.
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : {}
   *     }
   * @apiUse Errors
   */
  uploadCurrentUserAvatar (req, res) {
    const {_id: userId, company: {_id: companyId}} = req.user
    req.params.id = userId
    Utils.extractFiles(req, res, 'logo')
    .then((data) => {
      req.body = {
        avatar: data[0].filename
      }
      return global.db.UserModel.httpPut(req, res)
    })
  }

  /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/users/info Get User Info
   * @apiName getUserInfo
   * @apiGroup User
   * @apiPermission Authorization (Roles: EAM, Admin, Team Leader)
   * @apiDescription Get User Info
   *
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : { UserObject }
   *     }
   *
   * @apiUse Errors
   */
  getUserInfo (req, res) {
    const {_id: userId, role} = req.user
    // if(role !== roles.admin && role!== roles.superAdmin){
    //   return res.forbidden('You have not permission');
    // }
    const options = { where: {_id: userId} }
    req.params['id'] = userId
    global.db.UserModel.httpGet(req, res, options)
  }

  /**
   * @apiVersion 1.0.0
   * @api {put} /api/v1/users/update-profile Update User profile
   * @apiName UpdateProfileUser
   * @apiGroup User
   * @apiPermission Authorization
   * @apiDescription Update user profile
   *
   * @apiUse UserModel
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 200 OK
   *     {
   *        code: 'OK',
   *        message: 'Operation is successfully executed',
   *        data : 'User edited'
   *     }
   *
   * @apiUse Errors
   */
  updateUserProfile (req, res) {
    const {_id: id} = req.user
    req.params.id = id
    global.db.UserModel.httpPut(req, res)
  }
}

module.exports = UserController
