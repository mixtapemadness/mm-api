'use strict'

module.exports = ({ TagRepository, TC }) => {
  const {
    schemaComposer,
    TypeComposer,
    UserTC
  } = TC

  const TagTC = TypeComposer.create({
    name: 'TagsType',
    fields: {
      id: 'ID',
      count: 'Int',
      description: 'String',
      link: 'String',
      name: 'String',
      slug: 'String',
      taxonomy: 'String',
      meta: ['String']
    }
  })

  TagTC.addResolver({
    name: 'getTags',
    args: {},
    type: [TagTC],
    resolve: ({ source, args }) => {
      return TagRepository.getTags()
    }
  })

  TagTC.addResolver({
    name: 'getTagById',
    args: { id: 'ID' },
    type: TagTC,
    resolve: ({ args }) => {
      return TagRepository.getTagById(args.id)
    }
  })

  TagTC.addResolver({
    name: 'getTagsByPostId',
    args: { id: 'ID' },
    type: [TagTC],
    resolve: ({ args }) => {
      return TagRepository.getTagsByPostId(args.id)
    }
  })

  schemaComposer.rootQuery().addFields({
    getTags: TagTC.getResolver('getTags'),
    getTagById: TagTC.getResolver('getTagById'),
    getTagsByPostId: TagTC.getResolver('getTagsByPostId')
  })

  TC.TagTC = TagTC

  return TagTC
}
