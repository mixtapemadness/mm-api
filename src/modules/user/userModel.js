/* eslint no-useless-escape:0 */
/* eslint handle-callback-err:0 */

const MyError = require('../../utils/responses/errors')
const { listRoles } = require('../../modules/roles/roles')
// const { listCategories } = require('../../modules/genres/genres')
// const { listGenres } = require('../../modules/categories/categories')

module.exports = (mongoose) => {
  const Schema = mongoose.Schema

  const userSchema = new Schema({
    profile: {
      social: {
        facebook: { type: String },
        twitter: { type: String },
        linkedin: { type: String },
        instagram: { type: String }
      },
      firstName: { type: String },
      lastName: { type: String },
      description: { type: String }, // profile description
      location: { type: String },
      birthDate: { type: Date },
      phone: { type: String },
      gender: { type: String },
      isVerified: { type: Boolean, default: false },
      // category: [{ type: String, enum: listCategories }],
      // genres: [{ type: String, enum: listGenres }],
      avatar: { type: String },
      passportPhoto: { type: String }
    },
    social: {
      facebook: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
      instagram: { type: String }
    },
    firstName: { type: String },
    lastName: { type: String },
    description: { type: String }, // profile description
    location: { type: String },
    birthDate: { type: Date },
    phone: { type: String },
    gender: { type: String },
    avatar: { type: String },
    passportPhoto: { type: String },
    bookingInfo: {
      minRate: { type: Number, default: 50 },
      maxRate: { type: Number, default: 1000 },
      bookingRate: { type: Number },
      depositRate: { type: Number },
      minimumBooking: { type: Number },
      cancellationPolicy: { type: Number },
      depositRequired: { type: Number },

      numberOfRooms: { type: Number, default: 0 },
      flightTicket: { type: Number, default: 1 },
      buyReturnTicket: { type: Boolean, default: false },
      isFoodAndBeverages: { type: Boolean, default: false },
      foodAndBeverages: { type: String },
      additionalTerms: { type: String },
      isPromoter: { type: Boolean, default: false }
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      required: true,
      match: [
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
        'Please fill a valid email address'
      ],
      index: true
    },
    password: {
      type: String,
      required: true
    },
    account: {
      active: {
        type: Boolean,
        default: false
      },
      resetPasswordToken: String,
      resetPasswordExpires: Date,
      activationToken: String,
      activationExpires: Date
    },
    socialLinks: {
      facebook: { type: String },
      twitter: { type: String },
      linkedin: { type: String }
    },
    video: {
      url: { type: String, required: false },
      description: { type: String, required: false }
    },
    isSuperAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    // category: { type: [{ type: String, enum: listCategories }], index: true },
    // genres: { type: [{ type: String, enum: listGenres }], index: true },
    role: { type: String, default: 'User', enum: listRoles },
    status: { type: String, default: 'confirmed' },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    invitation: {
      invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      createDate: { type: Date }
    },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    createdOn: { type: Date, default: Date.now },
    modifier: { type: Schema.Types.ObjectId, ref: 'User' },
    modifiedOn: { type: Date },
    timezone: { type: Number },
    review: {
      count: { type: Number, default: 0 },
      rating: { type: Number, default: 0 }
    },
    favouriteTalents: [{ type: String }],
    hasCalendarPublic: { type: Boolean, default: false },
    hasSoundOn: {
      notification: { type: Boolean, default: false },
      message: { type: Boolean, default: false }
    },
    paypal: {
      email: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        required: false,
        match: [
          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
          'Please fill a valid email address'
        ]
      },
      preapprovalKey: { type: String, required: false }
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      required: false,
      index: true
    }
  }, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    setDefaultsOnInsert: true
  })

  userSchema.pre('save', async function (next) {
    this.modifiedOn = Date.now()

    if (this.slug) {
      this.slug = this.slug.trim().toLowerCase().split(' ').join('-')
    }

    next()
  })

  userSchema.virtual('id').get(function () {
    return this._id
  })

  // checking if password is valid
  userSchema.methods.validatePassword = function (password) {
    const bcrypt = require('bcrypt-nodejs')

    return bcrypt
      .compareSync(password, this.password)
  }

  userSchema.statics.findOneByAnyEmailOrUsername = function (email) {
    // Now by default we are setting user as active
    return this
      .findOne({
        email: { $regex: `^${email}$`, $options: 'i' }
      })
  }

  userSchema.statics.getByEmail = function (email) {
    // Now by default we are setting user as active
    return this
      .findOne()
      .where('email').equals(email)
  }

  userSchema.statics.findUserByToken = function (token) {
    return this
      .findOne()
      .where('account.activationToken').equals(token)
  }

  userSchema.statics.findUserByPasswordToken = function (token) {
    return this
      .findOne()
      .where('account.resetPasswordToken').equals(token)
      .where('account.resetPasswordExpires').gte(Date.now())
  }

  // check if user email already exists in company
  userSchema.statics.checkIfEmailExist = function (email, id) {
    return this
      .findOne({
        email: { $regex: `^${email}$`, $options: 'i' },
        _id: { $ne: id }
      })
      .then(user => {
        if (!user || !user._id) {
          return Promise.resolve(
            MyError.notFound('User not found')
          )
        }
        // return Promise.reject(MyError.badRequest('User exists with this email'))
        return Promise.reject(
          MyError.badRequest('User already joined!')
        )
      })
  }

  userSchema.methods.toJSON = function () {
    const obj = this.toObject()
    if (obj.account) {
      // set active at root
      obj.active = obj.account.active
    }
    // remove props that should not be exposed
    delete obj.password
    delete obj.__v
    // delete obj._id
    delete obj.account
    delete obj.favouriteTalents

    return obj
  }

  userSchema.methods.toJSONWithoutId = function () {
    const obj = this.toObject()
    // set active at root
    if (obj.account) {
      // set active at root
      obj.active = obj.account.active
    }
    // remove props that should not be exposed
    delete obj.password
    delete obj.__v
    // delete obj._id
    delete obj.account
    delete obj._id
    // delete obj.id

    return obj
  }

  return mongoose.model('User', userSchema)
}
