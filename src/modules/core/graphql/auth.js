'use strict'

const isAuthenticated =
  next =>
    // `rp` consist from { source, args, context, info, projection }
    rp => {
      if (!rp.context.user) {
        throw new Error('User not authorized')
      }

      return next(rp)
    }

module.exports = {
  isAuthenticated
}
