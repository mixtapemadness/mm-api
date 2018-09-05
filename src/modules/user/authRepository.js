/* eslint handle-callback-err:0 */
'use strict'

const MyError = require('../../utils/responses/errors')
const Utils = require('../../utils/Utils')
const appConfig = require('app/config')
const MailService = require('../../services/sendgrid/sendgridSevice')
const jwtService = require('../../services/jwtService')
const Promise = require('bluebird')
const config = require('../../config')

class AuthRepository {
  constructor ({ db }) {
    this.db = db
  }

  signUp ({ email, password, role, firstName, lastName, phone }) {
    const { UserModel } = this.db

    return UserModel
      .checkIfEmailExist(email)
      .then(async () => await this.getAvailableSlug(`${firstName}-${lastName}`))
      .then(slug => {
        const data = {
          email,
          password: Utils.generateHash(password),
          account: {
            activationToken: jwtService(config.jwt).sign({
              date: new Date()
            }),
            activationExpires: Date.now() +
              appConfig.auth.activationTokenExpiresIn
          },
          firstName,
          lastName,
          slug,
          phone,
          alias: `${firstName} ${lastName}`,
          role: role //  default role
        }

        return new UserModel(data)
          .save()
      })
      .then(user => {
        MailService
          .send({
            templateName: 'SignUp',
            templateData: user,
            to: user.email,
            from: 'no-reply@mixtape.com',
            subject: 'Welcome to booking bravo'
          })

        return user
      })
      .then(user => {
        const accessToken = jwtService(appConfig.jwt)
          .sign({
            id: user.id
          })

        return {
          accessToken: accessToken,
          user: user.toJSONWithoutId()
        }
      })
  }

  signIn ({ email, password, ip, device }) {
    const { UserModel } = this.db

    return UserModel
      .findOneByAnyEmailOrUsername(email)
      .then(user => {
        if (!user) {
          return Promise.reject(
            MyError.notFound(`The email doesn’t match any account or is not active.`)
          )
        }
        if (!user.account.active) {
          return Promise.reject(
            MyError.notFound(`Your email is not confirmed.`)
          )
        }
        if (!user.validatePassword(password)) {
          return Promise.reject(
            MyError.notFound('The password you’ve entered is incorrect.')
          )
        }

        const accessToken = jwtService(appConfig.jwt)
          .sign({ id: user.id })

        return {
          accessToken: accessToken
        }
      })
  }

  activateAccount ({ token }) {
    const { UserModel } = this.db

    return UserModel
      .findUserByToken(token)
      .then(user => {
        if (!user) {
          return Promise.reject(
            MyError.notFound('The token doesn’t match any account or not valid.')
          )
        }

        user.account.active = true
        user.account.activationToken = ''
        user.account.activationExpires = null

        return user
          .save()
      })
      .then(result => result.toJSONWithoutId())
  }

  deactivateAccount ({ user }) {
    user.account.active = false

    return user
      .save()
      .then(result => result.toJSONWithoutId())
  }

  requestResetPassword ({ email }) {
    return global.db.UserModel.findOneByAnyEmailOrUsername(email)
      .then((user) => {
        if (!user) return Promise.reject(MyError.notFound('The email doesn’t match any account.'))
        user.account.resetPasswordToken = Utils.generateRandomHash()
        user.account.resetPasswordExpires = Date.now() + appConfig.auth.resetPasswordTokenExpiresIn
        const newUser = new global.db.UserModel(user)
        return newUser.save()
      })
      .then(user => {
        MailService.send({
          templateName: 'resetPassword',
          templateData: user,
          to: user.email,
          from: 'no-reply@mixtape.com',
          subject: 'Reset password'
        })

        return user
      })
      .catch((err) => {
        return Promise.reject(MyError.notFound(err))
      })
  }

  resetPassword ({ token, password }) {
    const { UserModel } = this.db

    return UserModel
      .findUserByPasswordToken(token)
      .then(user => {
        if (!user) {
          return Promise.reject(
            MyError.notFound('The token doesn’t match any account or not valid.')
          )
        }

        if (user.validatePassword(password)) {
          return Promise.reject(
            MyError.notFound('You can not set the current password.')
          )
        }

        const newPassword = Utils
          .generateHash(password)

        user.password = newPassword
        user.account.resetPasswordToken = ''
        user.account.resetPasswordExpires = null

        return new UserModel(user)
          .save()
      })
      .then(result => result.toJSON())
  }

  changePassword ({ oldPassword, newPassword, user }) {
    const { UserModel } = this.db

    if (
      !newPassword ||
      !user.validatePassword(oldPassword)
    ) {
      return Promise.reject(
        new Error('old password is incorrect')
      )
    }
    user.password = Utils
      .generateHash(newPassword)

    return new UserModel(user)
      .save()
      // .then(result => result.toJSONWithoutId())
  }

  refreshToken ({ headers }) {
    return new Promise((resolve, reject) => {
      try {
        const token = Utils.extractToken({ headers })

        const oldDecoded = jwtService(appConfig.jwt)
          .decode(token)

        const accessToken = jwtService(appConfig.jwt)
          .sign({ id: oldDecoded.id })

        return resolve({
          accessToken
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  async resendActivationToken (email) {
    var { UserModel } = this.db

    var user = await UserModel.findOne({email: { $regex: `^${email}$`, $options: 'i' }})

    if (!user) {
      return Promise.reject(
        MyError.notFound(`The email doesn’t match any account.`)
      )
    }

    if (user.account && user.account.active) {
      return Promise.reject(
        MyError.notFound(`This user is already verified.`)
      )
    }

    user.account = {
      activationToken: jwtService(config.jwt).sign({
        date: new Date()
      }),
      activationExpires: Date.now() + appConfig.auth.activationTokenExpiresIn
    }

    user.save()

    MailService.send({
      templateName: 'activationResend',
      templateData: user,
      to: user.email,
      from: 'no-reply@mixtape.com',
      subject: 'Email confirmation link from booking bravo'
    })

    return { resend: true }
  }

  async getAvailableSlug (alias) {
    if (!alias) {
      return Promise.reject(
        MyError.badRequest('Insufficient data provided.')
      )
    }

    const slug = alias.trim().toLowerCase().split(' ').join('-')

    const isTaken = await this.db.UserModel.findOne({ slug }, '_id')

    if (!isTaken) {
      return slug
    }

    const similar = await this.db.UserModel.find({
      slug: { $regex: `^${slug}` }
    }, ['_id', 'slug'])

    const slugsOnly = similar.map(s => s.slug)

    for (let i = 1; i < (slugsOnly.length + 2); i++) {
      const slugNew = `${slug}${i}`

      if (!slugsOnly.includes(slugNew)) {
        return slugNew
      }
    }
  }
}

module.exports = AuthRepository

