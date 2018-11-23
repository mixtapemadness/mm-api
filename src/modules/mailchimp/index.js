const getMailChimpRepository = (wp) => {
  var MailChimpRepository = require('app/modules/mailchimp/mailchimpRepository')
  return new MailChimpRepository(wp)
}

const getGraphql = ({ db, TC, wp }) => {
  return require('app/modules/mailchimp/mailchimpGraphql')({
    BookingModel: db.BookingModel,
    TC,
    mailchimpRepository: getMailChimpRepository(wp)
  })
}

module.exports = {
  getMailChimpRepository,
  getGraphql,
  initModel: () => '',
  getRouteV1: () => ''
}

