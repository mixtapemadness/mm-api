var moment = require('moment')
var config = require('../../../config')
var urljoin = require('url-join')

module.exports = Object.assign(
  {
    formatDate (date, format) {
      return moment(date).format(format)
    },
    capitalize (str) {
      return str[0].toUpperCase() + str.substring(1)
    },
    frontUrl (...args) {
      return urljoin(config.front_url, ...args.filter(a => typeof a === 'string'))
    },
    backUrl (...args) {
      return urljoin(config.back_url, ...args.filter(a => typeof a === 'string'))
    },
    join (str1, str2) {
      return str1 + str2
    },
    avatarUrl (filename) {
      if (!filename) {
        return ''
      }

      return filename.startsWith('http')
        ? filename
        : `${config.back_url}/avatars/${filename}`
    },
    toString (stringable) {
      return toString(stringable)
    }
  },
  require('./headingMessageSwitcher'),
  require('./bookings'),
  require('./invitations')
)
