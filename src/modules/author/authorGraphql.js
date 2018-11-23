'use strict'

module.exports = ({ AuthorRepository, TC }) => {
  const {
    schemaComposer,
    TypeComposer
  } = TC

  const AuthorTC = TypeComposer.create({
    name: 'AuthorType',
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

  AuthorTC.addResolver({
    name: 'getAuthors',
    args: {},
    type: [AuthorTC],
    resolve: ({ source, args }) => {
      return AuthorRepository.getAuthors()
    }
  })

  AuthorTC.addResolver({
    name: 'getAuthorById',
    args: { id: 'ID' },
    type: AuthorTC,
    resolve: ({ source, args }) => {
      return AuthorRepository.getAuthorById(args.id)
    }
  })

  AuthorTC.addResolver({
    name: 'getAuthorBySlug',
    args: { slug: 'String' },
    type: AuthorTC,
    resolve: ({ source, args }) => {
      return AuthorRepository.getAuthorBySlug(args.slug)
    }
  })

  schemaComposer.rootQuery().addFields({
    getAuthors: AuthorTC.getResolver('getAuthors'),
    getAuthorById: AuthorTC.getResolver('getAuthorById'),
    getAuthorBySlug: AuthorTC.getResolver('getAuthorBySlug')
  })

  TC.AuthorTC = AuthorTC

  return AuthorTC
}
