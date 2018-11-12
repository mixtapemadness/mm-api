/* eslint handle-callback-err:0 */
'use strict'

const Promise = require('bluebird')
const R = require('ramda')
const MyError = require('../../utils/responses/errors')

class UserRepo {
  constructor ({ db }) {
    this.db = db
  }

  async updateProfile (data) {
    const { user } = data
    const profile = R.omit(['user'], data)
    console.log('profile: ', profile)

    user.set(profile)

    const { isExisting } = profile.slug
      ? await this.checkSlug({ slug: profile.slug }, user)
      : { isExisting: false }

    if (isExisting) {
      return Promise.reject(
        MyError.notFound(`This username is already taken.`)
      )
    }

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
}

module.exports = UserRepo

