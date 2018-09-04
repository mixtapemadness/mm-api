'use strict'

const forOwn = require('lodash/forOwn')
const R = require('ramda')
const talentsMeta = require('../helpers/datasets/talentsMeta')

const generateTalentsBrowseType = () => {
  let type = 'type TalentsBrowse {'
  talentsMeta.listCategories.forEach(function(category) {
    type += `
      ${category}: TalentsWithCount
    `
  })
  type += '}'
  return type
}

const {
  composeWithMongoose
} = require('graphql-compose-mongoose/node8')

const {
  isAuthenticated,
  attachToAll,
  chainToResolver,
  promiseToPostResolver
} = require('../core/graphql')

module.exports = ({
  UserModel,
  TC,
  authRepository,
  userRepository
}) => {
  const { schemaComposer } = TC

  const AccessTokenTC = `
    type AccessToken {
      accessToken: String
    }
  `
  const ResendTC = `
    type ResendTC {
      resend: Boolean
    }
  `
  const SlugTC = `
    type Slug {
      slugAvailable: String
    }
  `

  const enumUserBlockAction = `
    enum EnumUserBlockAction {
      push
      pull
    }
  `

  const UserTC = composeWithMongoose(UserModel, {})
  schemaComposer.TypeComposer.create(`
    type TalentsWithCount {
      count: Int
      items: [User]
    }
  `)

  UserTC.removeField(['password', '__v', 'account', 'favouriteTalents'])

  UserTC.addFields({
    favorited: {
      type: 'Boolean',
      resolve: async (source, args, context) => {
        if (context.user) {
          return userRepository.isMyFavourite({ user: context.user, talentId: source._id })
        }
        return false
      }
    },
    fullName: {
      type: 'String',
      resolve: ({ fullName }) => fullName
    }
  })

  UserTC.addFields({
    blockedUsersArray: {
      type: [UserTC],
      resolve: async (source, args, context) => {
        return await UserModel.find({ _id: { $in: context.user.blockedUsers } })
      }
    }
  })

  UserTC.addResolver({
    name: 'me',
    type: UserTC,
    resolve: ({ context }) =>
      context.user.toJSON()
  })

  UserTC.addResolver({
    name: 'signUp',
    args: {
      email: 'String',
      password: 'String',
      role: UserTC.getFieldType('role'),
      firstName: 'String',
      lastName: 'String',
      phone: 'String'
    },
    type: AccessTokenTC,
    resolve: ({ args }) =>
      authRepository.signUp(args)
  })

  UserTC.addResolver({
    name: 'signIn',
    args: {
      email: 'String',
      password: 'String'
    },
    type: AccessTokenTC,
    resolve: ({ args }) =>
      authRepository.signIn(args)
  })

  UserTC.addResolver({
    name: 'refreshToken',
    args: {
      token: 'String'
    },
    type: AccessTokenTC,
    resolve: ({ context }) =>
      authRepository.refreshToken(context)
  })

  UserTC.addResolver({
    name: 'resendActivationToken',
    args: {
      email: 'String'
    },
    type: ResendTC,
    resolve: ({ args: { email } }) =>
      authRepository.resendActivationToken(email)
  })

  UserTC.addResolver({
    name: 'changePassword',
    args: {
      oldPassword: 'String',
      newPassword: 'String'
    },
    type: UserTC,
    resolve: ({ args, context: { user } }) =>
      authRepository.changePassword(
        Object.assign(args, { user })
      )
  })

  UserTC.addResolver({
    name: 'requestResetPassword',
    args: {
      email: 'String'
    },
    type: UserTC,
    resolve: ({ args }) =>
      authRepository.requestResetPassword(args)
  })

  UserTC.addResolver({
    name: 'resetPassword',
    args: {
      token: 'String',
      password: 'String'
    },
    type: UserTC,
    resolve: ({ args }) =>
      authRepository.resetPassword(args)
  })

  UserTC.addResolver({
    name: 'activateAccount',
    args: {
      token: 'String'
    },
    type: UserTC,
    resolve: ({ args }) =>
      authRepository.activateAccount(args)
  })

  UserTC.addResolver({
    name: 'deactivateAccount',
    args: {},
    type: UserTC,
    resolve: ({ context }) =>
      authRepository.deactivateAccount(context)
  })

  const TalentsMetaTC = schemaComposer.TypeComposer.create({
    name: 'TalentsMeta',
    fields: {
      listCategories: ['String'],
      listGenres: ['String'],
      genres: [`type Genre { value: String, label: String }`],
      categories: [`type Category{ value: String, label: String }`]
    }
  })

  UserTC.addResolver({
    name: 'talentsMeta',
    type: TalentsMetaTC,
    resolve: () => {
      return talentsMeta
    }
  })

  UserTC.addResolver({
    name: 'talentsBrowse',
    args: {
      filter: `input FilterTalentsBrowseInput {
        location: String
        talent: String
        categories: [String]
        genres: [String]
        status: String
      }`
    },
    type: generateTalentsBrowseType(),
    resolve: rp => {
      // console.log('rp.args: ', rp.args)
      const filter = rp.args.filter || {}
      return userRepository.talentsBrowse(talentsMeta.listCategories, filter)
    }
  })

  UserTC.addResolver({
    name: 'profileUpdate',
    args: UserTC.get('$createOne').getArgs(),
    type: UserTC,
    resolve: ({ args: { record }, context: { user } }) => {
      const profile = R.pick([
        'avatar',
        'firstName',
        'lastName',
        'birthDate',
        'description',
        'buyReturnTicket',
        'gender',
        'category',
        'phone',
        'genres',
        'social',
        'bookingInfo',
        'timezone',
        'video',
        'location',
        'passportPhoto',
        'hasCalendarPublic',
        'hasSoundOn',
        'alias',
        'showAlias',
        'payoutMethods',
        'email',
        'status'
      ],
        record
      )

      return userRepository.updateProfile(
        Object.assign(profile, { user })
      )
    }
  })

  // const RegexpObj = InputTypeComposer.create(`
  //   input AuthorInput {
  //     id: Int!
  //     firstName: String
  //     lastName: String
  //     status: String @default(value: "new")
  //   }
  // `)

  const withRegexp = {
    name: 'regexp',
    type: `input Criterion {
      fields: [String]
      value: String
      operator: String
      options: String
      mode: String
    }`,
    description: 'Search by regExp',
    query: (rawQuery, obj, resolveParams) => {
      // rawQuery[obj.key] = new RegExp(obj.value, 'i')
    }
  }

  const withSearch = {
    name: 'search',
    type: `input Search {
      criteria: [Criterion]
    }`,
    description: 'Search by regExp or',
    query: (rawQuery, obj, resolveParams) => {
      rawQuery.$and = []

      forOwn(obj.criteria, (v) => {
        const n = {}
        if (v.value) {
          if (v.mode && v.mode === 'combination') {
            n.$and = []
            const words = v.value.trim().split(' ')
            words.map(w => {
              const m = { $or: [] }
              v.fields.map(f => {
                m.$or.push({ [f]: new RegExp(w, 'i') })
              })
              n.$and.push(m)
            })
          } else if (v.mode && v.mode === 'multiword') {
            const keywords = v.value.trim()
            const operator = v.operator || '$or'
            const options = v.options || 'ig'

            n[operator] = []
            v.fields.map(f => {
              n[operator].push({ [f]: new RegExp(keywords, options) })
            })
          } else {
            const words = v.value.trim().split(' ')
            const keywords = words.join('|')
            const operator = v.operator || '$or'
            const options = v.options || 'ig'

            n[operator] = []
            v.fields.map(f => {
              n[operator].push({ [f]: new RegExp(keywords, options) })
            })
          }
        }
        rawQuery.$and.push(n)
      })

      // console.log(JSON.stringify(rawQuery))
    }
  }

  UserTC.addResolver({
    name: 'favoriteTalent',
    args: {
      talentId: UserTC.getFieldType('_id'),
      remove: 'Boolean'
    },
    type: UserTC,
    resolve: ({ args: { talentId, remove }, context: { user } }) => {
      if (String(user._id) === String(talentId)) {
        return Promise.reject('You can not favorite yourself')
      }
      return userRepository.favorite({
        user,
        talentId,
        remove
      })
    }
  })

  const favouriteTalents =
    UserTC.getResolver('findByIds')
      .wrap(newResolver => {
        newResolver.removeArg('_ids')
        const nr = newResolver.wrapResolve(next => rp => {
          rp.args._ids = rp.context.user.favouriteTalents
          return next(rp)
        })
        return nr
      })

  UserTC.addResolver({
    name: 'favouriteTalentsNew',
    type: [UserTC],
    resolve: ({ context: { user } }) => {
      return userRepository.getFavouriteTalents(user._id)
    }
  })

  UserTC.addResolver({
    name: 'removeUserImage',
    args: {
      fieldName: 'String'
    },
    type: UserTC,
    resolve: ({ args: { fieldName }, context: { user } }) => {
      return userRepository.removeUserImage(user._id, fieldName)
    }
  })

  // UserTC.addResolver({
  //   name: 'isMyFavourite',
  //   args: {
  //     talentId: UserTC.getFieldType('_id')
  //   },
  //   type: 'Boolean',
  //   resolve: ({ args, context: { user } }) => {
  //     return userRepository.isMyFavourite({
  //       user,
  //       ...args
  //     })
  //   }
  // })

  UserTC.addResolver({
    name: 'profileUpdateById',
    args: {
      record: UserTC.get('$createOne').getArg('record'),
      talentId: UserTC.getFieldType('_id')
    },
    type: UserTC,
    resolve: ({ args: { talentId, record }, context: { user } }) => {
      const profile = R.pick([
        'avatar',
        'firstName',
        'lastName',
        'birthDate',
        'description',
        'buyReturnTicket',
        'gender',
        'category',
        'genres',
        'social',
        'bookingInfo',
        'timezone',
        'video',
        'location',
        'passportPhoto',
        'hasCalendarPublic',
        'isVerified'
      ],
        record
      )

      return userRepository.updateProfileById(profile, talentId)
    }
  })

  UserTC.addResolver({
    name: 'addressPredictionsGet',
    args: {
      term: 'String'
    },
    type: [schemaComposer.TypeComposer.create(`
      type Address {
        place_id: String
        description: String
      }
    `)],
    resolve: ({ args }) => {
      return userRepository.addressPredictionsGet(args)
    }
  })

  UserTC.addResolver({
    name: 'checkSlug',
    args: {
      slug: 'String'
    },
    type: SlugTC,
    resolve: ({ args, context: { user } }) =>
      ({ slugAvailable: userRepository.getAvailableSlug(args.slug, user) })
  })

  UserTC.addResolver({
    name: 'blockUser',
    args: {
      userId: UserTC.getFieldType('_id'),
      action: enumUserBlockAction
    },
    type: UserTC,
    resolve: async ({ args: { userId, action = 'push' }, context: { user } }) => {
      const bookingsCount = await global.db.BookingModel.count({
        $and: [{
          $or: [
            { status: 'request' },
            { status: 'booked' },
            { status: 'accepted' }
          ]
        }, {
          $or: [
            { bookerId: user._id, talentId: userId },
            { bookerId: userId, talentId: user._id }
          ]
        }]
      })

      if (bookingsCount) {
        return Promise.reject('You can not block user with active booking')
      }

      await UserModel.update({
        _id: user._id
      }, {
        ['$' + action]: {
          blockedUsers: userId
        }
      })

      return user
    }
  })

  const usersManyInviteAvailable = UserTC.get('$findMany').wrapResolve(next => async rp => {
    if (!rp.args.filter) {
      rp.args.filter = {}
    }

    var invites = await global.db.InvitationModel.find({
      $or: [
        { creator: rp.context.user._id },
        { receiverId: rp.context.user._id }
      ],
      status: { $in: ['requested', 'accepted'] }
    })

    var ids = invites.map(i => String(i.creator) === String(rp.context.user._id)
      ? i.receiverId : i.creator)

    var blockers = await global.db.UserModel.find({ blockedUsers: rp.context.user._id })

    rp.args.filter._id = { $nin: [...ids, ...blockers.map(u => u._id)] }

    return next(rp)
  })

  const blockedUsers = UserTC.getResolver('findByIds')
    .wrap(newResolver => {
      newResolver.removeArg('_ids')
      const nr = newResolver.wrapResolve(next => rp => {
        rp.args._ids = rp.context.user.blockedUsers
        return next(rp)
      })
      return nr
    })

  UserTC.addResolver({
    name: 'userBlockDates',
    args: {
      talentId: UserTC.getFieldType('creator'),
      dates: UserTC.getFieldType('blockedDates')
    },
    type: UserTC,
    resolve: ({ args: { talentId, dates }, context: { user } }) =>
      userRepository.blockDates(dates, talentId, user)
  })

  const userBlockDates = chainToResolver([
    UserTC.getResolver('userBlockDates'),
    promiseToPostResolver([
      ({ args: { talentId }, context: { user } }, payload) => userRepository.notifyBlockDates(talentId, user)
    ], [
      'args',
      'context'
    ])
  ])

  schemaComposer
    .rootQuery()
    .addFields({
      ...attachToAll(isAuthenticated)({
        me: UserTC.getResolver('me'),
        favouriteTalents,
        blockedUsers,
        favouriteTalentsNew: UserTC.getResolver('favouriteTalentsNew'),
        usersManyInviteAvailable: usersManyInviteAvailable.addFilterArg(withRegexp).addFilterArg(withSearch)
      }),
      userOne: UserTC.getResolver('findOne'),
      talents: UserTC.get('$findMany').addFilterArg(withRegexp).addFilterArg(withSearch),
      talentsCount: UserTC.getResolver('count').addFilterArg(withRegexp).addFilterArg(withSearch),
      // topTalents: UserTC.getResolver('topTalents')
      addressPredictionsGet: UserTC.getResolver('addressPredictionsGet'),
      checkSlug: UserTC.getResolver('checkSlug'),
      talentsMeta: UserTC.getResolver('talentsMeta'),
      talentsBrowse: UserTC.getResolver('talentsBrowse')
    })
  schemaComposer
    .rootMutation()
    .addFields({
      signUp: UserTC.getResolver('signUp'),
      signIn: UserTC.getResolver('signIn'),
      requestResetPassword: UserTC.getResolver('requestResetPassword'),
      resetPassword: UserTC.getResolver('resetPassword'),
      activateAccount: UserTC.getResolver('activateAccount'),
      refreshToken: UserTC.getResolver('refreshToken'),
      profileUpdateById: UserTC.getResolver('profileUpdateById'),
      resendActivationToken: UserTC.getResolver('resendActivationToken'),
      ...attachToAll(isAuthenticated)({
        removeUserImage: UserTC.getResolver('removeUserImage'),
        changePassword: UserTC.getResolver('changePassword'),
        deactivateAccount: UserTC.getResolver('deactivateAccount'),
        profileUpdate: UserTC.getResolver('profileUpdate'),
        favoriteTalent: UserTC.getResolver('favoriteTalent'),
        blockUser: UserTC.getResolver('blockUser'),
        userBlockDates: userBlockDates
        // userBlockDates: UserTC.getResolver('userBlockDates')
      })
    })

  TC.UserTC = UserTC

  return UserTC
}
