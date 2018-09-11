'use strict'

module.exports = ({ PostsRepository, TC }) => {
  const {
    schemaComposer,
    TypeComposer,
    TagTC,
    CategoriesTC,
    InputTypeComposer,
    EnumTypeComposer
  } = TC

  const PostsTC = TypeComposer.create({
    name: 'PostType',
    fields: {
      id: 'ID!',
      date: 'String',
      date_gmt: 'String',
      link: 'String',
      name: 'String',
      slug: 'String',
      guid: 'ID',
      modified: 'String',
      modified_gmt: 'String',
      status: 'String',
      type: 'String',
      title: 'String',
      content: 'String',
      excerpt: 'String',
      author: 'Int',
      featured_media: 'Int',
      comment_status: 'String',
      ping_status: 'String',
      sticky: 'Boolean',
      template: 'String',
      format: 'String',
      meta: ['String']
    }
  })

  const filterPostInput = InputTypeComposer.create({
    name: 'filterPostInput',
    fields: {
      categories: ['ID'],
      tags: ['ID'],
      author: ['ID']
    }
  })

  const sortPostInput = EnumTypeComposer.create({
    name: 'sortPostInput',
    values: {
      ID_ASC: { value: { order: 'asc', orderBy: 'id' } },
      ID_DESC: { value: { order: 'desc', orderBy: 'id' } },
      DATE_ASC: { value: { order: 'asc', orderBy: 'date' } },
      DATE_DESC: { value: { order: 'desc', orderBy: 'date' } },
      AUTOR_ASC: { value: { order: 'asc', orderBy: 'author' } },
      AUTHOR_DESC: { value: { order: 'desc', orderBy: 'author' } },
      TITLE_ASC: { value: { order: 'asc', orderBy: 'title' } },
      TITLE_DESC: { value: { order: 'desc', orderBy: 'title' } }
      // FEATURED_ASC: { value: { order: 'asc', orderBy: 'featured_media' } },
      // FEATURED_DESC: { value: { order: 'desc', orderBy: 'featured_media' } }
    }
  })

  PostsTC.addResolver({
    name: 'getPosts',
    args: {
      filter: filterPostInput,
      sort: sortPostInput,
      perPage: 'ID',
      page: 'ID'
    },
    type: [PostsTC],
    resolve: ({ source, args }) => {
      return PostsRepository.getPosts(args)
    }
  })

  PostsTC.addResolver({
    name: 'getPostById',
    args: { id: 'ID' },
    type: PostsTC,
    resolve: ({ args }) => {
      return PostsRepository.getPostById(args.id)
    }
  })

  // PostsTC.addResolver({
  //   name: 'getPostsByCategoriesId',
  //   args: { id: 'ID' },
  //   type: [PostsTC],
  //   resolve: ({ args }) => {
  //     return PostsRepository.getPostsByCategoriesId(args.id)
  //   }
  // })

  // Relations
  PostsTC.addRelation(
    'tags', {
      resolver: () => TagTC.getResolver('getTagsByPostId'),
      prepareArgs: {
        id: (source) => source.id
      }
    }
  )

  PostsTC.addRelation(
    'Category', {
      resolver: () => CategoriesTC.getResolver('getCategoriesByPostId'),
      prepareArgs: {
        id: (source) => source.id
      }
    }
  )

  schemaComposer.rootQuery().addFields({
    getPosts: PostsTC.getResolver('getPosts'),
    getPostById: PostsTC.getResolver('getPostById')
    // getPostsByCategoriesId: PostsTC.getResolver('getPostsByCategoriesId')
  })

  TC.PostsTC = PostsTC

  return PostsTC
}
