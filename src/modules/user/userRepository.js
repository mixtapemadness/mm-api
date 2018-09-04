/* eslint handle-callback-err:0 */
'use strict'

const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
const R = require('ramda')
const config = require('app/config')
const MyError = require('../../utils/responses/errors')

class UserRepo {
  constructor ({ db, notificationRepository }) {
    this.db = db
    this.notificationRepository = notificationRepository
  }

  async updateProfile (data) {
    const { user, alias } = data
    const profile = R.omit(['user'], data)
    console.log('profile: ', profile)

    // TODO: alias field needs elaboration
    if (alias) {
      if (!alias.match('^[a-zA-Z0-9 _-]*$')) {
        return Promise.reject(
          MyError.badRequest('Alias incorrect format.')
        )
      }
      const availableSlug = await this.getAvailableSlug(alias, user)
      profile.slug = availableSlug
    }

    user.set(profile)

    return user
      .save()
      // .then(result => result.toJSONWithoutId())
  }

  async updateProfileById (record, userId) {
    try {
      const user = await this.db.UserModel.findOne({ _id: userId })

      console.log('profile: ', record)
      console.log('user:', user)

      user.set(record)

      return user
        .save()
    } catch (e) {
      console.log(e.message)
    }
  }

  async removeUserImage (userId, fieldName) {
    try {
      console.log(userId, fieldName)
      const user = await this.db.UserModel.findOne({ _id: userId })

      const filepath = path.join(config.upload.dir, user[fieldName])

      console.log('filepath: ', filepath)

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }

      if (fieldName === 'avatar') user.set({ avatar: '' })
      if (fieldName === 'passportPhoto') user.set({ passportPhoto: '' })

      return user
        .save()
    } catch (e) {
      console.log(e.message)
    }
  }

  async getFavouriteTalents (userId) {
    try {
      const user = await this.db.UserModel.findOne({ _id: userId })

      const result = await this.db.UserModel.find({
        status: { $ne: 'deleted' },
        _id: { $in: user.favouriteTalents },
        role: 'talent'
      })

      return result
    } catch (e) {
      console.log(e.message)
    }
  }

  async favorite ({ user, talentId, remove = false }) {
    if (remove) {
      user.favouriteTalents = user.favouriteTalents.filter(i => i !== talentId)
    } else {
      if (user.favouriteTalents.indexOf(talentId) === -1) {
        user.favouriteTalents = [...user.favouriteTalents, talentId]
      }
    }

    await user.save()

    return this.db.UserModel.findOne({ _id: talentId })
  }

  isMyFavourite ({ user, talentId }) {
    return user.favouriteTalents && user.favouriteTalents.includes(String(talentId))
  }

  async addressPredictionsGet (args) {
    try {
      const axios = require('axios')
      const config = require('../../config')

      const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${args.term}&types=(cities)&key=${config.google.mapApiKey}`)

      return response.data.predictions.map(x => ({
        place_id: x.place_id,
        description: x.description
      }))
    } catch (e) {
      console.error(e)

      return []
    }
  }

  async checkSlug (args, user) {
    if (!args.slug || !user) {
      return { isExisting: true }
    }

    const existing = await this.db.UserModel.findOne({ slug: args.slug, _id: { $ne: user._id } })

    if (!existing) {
      return { isExisting: false }
    }

    return { isExisting: true }
  }

  async getAvailableSlug (alias, user) {
    if (!alias || !user) {
      return Promise.reject(
        MyError.badRequest('Insufficient data provided.')
      )
    }

    const slug = alias.trim().toLowerCase().split(' ').join('-')

    const isTaken = await this.db.UserModel.findOne({
      _id: { $ne: user._id },
      slug
    }, '_id')

    if (!isTaken) {
      return slug
    }

    const similar = await this.db.UserModel.find({
      _id: { $ne: user._id },
      slug: { $regex: `^${slug}` }
    }, ['_id', 'slug'], { sort: { slug: 1 } })

    const slugsOnly = similar.map(s => s.slug)

    for (let i = 1; i < (slugsOnly.length + 2); i++) {
      const slugNew = `${slug}${i}`

      if (!slugsOnly.includes(slugNew)) {
        return slugNew
      }
    }
  }

  async talentsBrowse (categories, filter) {
    let results = {}

    let cats = (filter.categories && filter.categories.length > 0)
      ? filter.categories
      : categories

    let criteria = { $and: [] }

    criteria.$and.push({ role: 'talent' })
    criteria.$and.push({ status: { $ne: 'deleted' } })

    if (filter.genres) {
      criteria.$and.push({ genres: { $in: filter.genres } })
    }

    if (filter.location) {
      const keywords = filter.location.trim()
      const options = 'ig'
      criteria.$and.push({ location: new RegExp(keywords, options) })
    }
    if (filter.talent) {
      const words = filter.talent.trim().split(' ')
      const talent = { $and: [] }
      words.map(w => {
        const m = {
          $or: [
            { firstName: new RegExp(w, 'i') },
            { lastName: new RegExp(w, 'i') },
            { alias: new RegExp(w, 'i') }
          ]
        }
        talent.$and.push(m)
      })
      criteria.$and.push(talent)
    }

    const users = cats.map(category => {
      const crit = Object.assign({}, criteria, {
        $and: [...criteria.$and, { category: { $in: [category] } }]
      })
      return {
        count: this.db.UserModel.find(crit, null).count(),
        items: this.db.UserModel.find(crit, null, { limit: 8 })
      }
    })

    const usersArr = await Promise.all(users)

    cats.forEach((v, k) => {
      results[v] = usersArr[k]
    })

    return results
  }

  async blockDates (dates, talentId, loggedUser) {
    const user = loggedUser.role === 'bookingAgent'
      ? await this.getFriend(talentId, loggedUser) : loggedUser

    if (!user) {
      return Promise.reject('User was not found.')
    }

    const unfilteredDates = Object.assign({}, user.blockedDates, dates)

    const blockedDates = Object.keys(unfilteredDates).reduce((res, key) => {
      if (unfilteredDates[key]) {
        res[key] = true
      }
      return res
    }, {})

    await this.db.UserModel.update({ _id: user._id }, {
      $set: { blockedDates }
    })

    user.blockedDates = blockedDates // for client

    return user
  }

  async getFriend (talentId, user) {
    const count = await this.db.InvitationModel.count({
      status: 'accepted',
      $or: [
        { creator: user._id, receiverId: talentId },
        { creator: talentId, receiverId: user._id }
      ]
    })

    if (!count) {
      return Promise.reject('User is not invited.')
    }

    return await this.db.UserModel.findOne({ _id: talentId })
  }

  async notifyBlockDates (talentId, user) {
    if (talentId) {
      await this.notificationRepository.registerNotification(
        talentId, // to
        'Your blocked dates modified', // message text
        talentId, // actionId
        'BlockDates', // actionType
        'User', // modelName
        user // receiver
      )
    }
  }
}

module.exports = UserRepo
