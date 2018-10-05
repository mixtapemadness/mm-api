'use strict'

module.exports = ({ MailChimpRepository, TC }) => {
  const {
    schemaComposer,
    TypeComposer
  } = TC

  const MailChimpTC = TypeComposer.create({
    name: 'MailChimpType',
    fields: {
      email_address: 'ID!',
      status: 'String'
    }
  })

  MailChimpTC.addResolver({
    name: 'subscribeToMailchimp',
    args: {
      email: 'String'
    },
    type: MailChimpTC,
    resolve: ({ source, args }) => {
      return MailChimpRepository.Subscribe(args)
    }
  })

  schemaComposer.rootMutation().addFields({
    subscribeToMailchimp: MailChimpTC.getResolver('subscribeToMailchimp')
  })

  TC.MailChimpTC = MailChimpTC

  return MailChimpTC
}
