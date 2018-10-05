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
      status: 'Boolean'
    }
  })

  MailChimpTC.addResolver({
    name: 'subscribeToMailchimp',
    args: {
      email_address: 'String'
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
