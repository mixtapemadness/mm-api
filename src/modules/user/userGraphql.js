'use strict'

module.exports = ({ UserRepository, TC }) => {
  const {
    schemaComposer,
    TypeComposer
  } = TC

  const UserTC = TypeComposer.create({
    name: 'UserType',
    fields: {
      id: 'ID',
      name: 'String',
      url: 'String',
      description: 'String',
      link: 'String',
      slug: 'String',
      avatar1: 'String',
      avatar2: 'String',
      avatar3: 'String',
      meta: ['String']
    }
  })

  UserTC.addResolver({
    name: 'getUsers',
    args: {},
    type: [UserTC],
    resolve: ({ source, args }) => {
      return UserRepository.getUsers()
    }
  })

  UserTC.addResolver({
    name: 'getUserById',
    args: { id: 'ID' },
    type: UserTC,
    resolve: ({ source, args }) => {
      return UserRepository.getUserById(args.id)
    }
  })

  UserTC.addResolver({
    name: 'getUserBySlug',
    args: { slug: 'ID' },
    type: UserTC,
    resolve: ({ source, args }) => {
      return UserRepository.getUserBySlug(args.slug)
    }
  })

  schemaComposer.rootQuery().addFields({
    getUsers: UserTC.getResolver('getUsers'),
    getUserById: UserTC.getResolver('getUserById'),
    getUserBySlug: UserTC.getResolver('getUserBySlug')
  })

  TC.UserTC = UserTC

  return UserTC
}
