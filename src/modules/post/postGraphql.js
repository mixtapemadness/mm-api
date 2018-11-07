'use strict'

module.exports = ({ PostsRepository, TC }) => {
  const {
    schemaComposer,
    TypeComposer,
    TagTC,
    CategoriesTC,
    UserTC,
    InputTypeComposer,
    EnumTypeComposer,
    MediaTC
  } = TC

  const PostsTC = TypeComposer.create({
    name: 'PostType',
    fields: {
      id: 'ID!',
      date: 'String',
      date_gmt: 'String',
      link: 'String',
      slug: 'String',
      guid: 'ID',
      modified: 'String',
      modified_gmt: 'String',
      status: 'String',
      type: 'String',
      title: 'String',
      content: 'String',
      excerpt: 'String',
      comment_status: 'String',
      ping_status: 'String',
      sticky: 'Boolean',
      template: 'String',
      format: 'String',
      meta: ['String'],
      featured_media: 'ID',
      author: 'ID',
      categories: ['ID'],
      tags: ['ID']
    }
  })

  const CountTC = TypeComposer.create({
    name: 'CountType',
    fields: {
      count: 'String'
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

  const FilterPostCategoryInput = EnumTypeComposer.create({
    name: 'filterPostCategoryInput',
    values: {
      VIDEOS: { value: 15 },
      AUDIO: { value: 2301 },
      NEWS: { value: 238 },
      ARTICLES: { value: 3 },
      UNCATEGORIZED: { value: 1 },
      EVENTS: { value: 247 },
      INTERVIEWS: { value: 8 },
      REVIEWS: { value: 237 }
    }
  })

  const filterPostInput = InputTypeComposer.create({
    name: 'filterPostInput',
    fields: {
      categories: [FilterPostCategoryInput],
      tags: ['ID'],
      author: ['ID'],
      search: 'String',
      slug: 'String'
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
    name: 'getTopPosts',
    args: {
    },
    type: [PostsTC],
    resolve: () => {
      return PostsRepository.getTopPosts()
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

  PostsTC.addResolver({
    name: 'searchPosts',
    args: {
      filter: filterPostInput,
      perPage: 'ID',
      page: 'ID'
    },
    type: [PostsTC],
    resolve: ({ args }) => {
      return PostsRepository.searchPosts(args)
    }
  })

  PostsTC.addResolver({
    name: 'getPostsCount',
    args: {
      filter: filterPostInput
    },
    type: CountTC,
    resolve: ({ args }) => {
      return PostsRepository.getPostsCount(args)
    }
  })

  PostsTC.addResolver({
    name: 'getPostBySlug',
    args: {
      slug: 'String'
    },
    type: PostsTC,
    resolve: ({ args }) => {
      return PostsRepository.getPostBySlug(args)
    }
  })

  PostsTC.addResolver({
    name: 'getPostsByAuthorId',
    args: {
      id: 'ID',
      perPage: 'ID',
      page: 'ID'
    },
    type: [PostsTC],
    resolve: ({ args }) => {
      return PostsRepository.getPostsByAuthorId(args)
    }
  })

  PostsTC.addResolver({
    name: 'getNextPostByAuthorId',
    args: {
      id: 'ID',
      date: 'String',
      page: 'ID',
      perPage: 'ID'
    },
    type: PostsTC,
    resolve: ({ args }) => {
      return PostsRepository.getNextPost(args)
    }
  })

  PostsTC.addResolver({
    name: 'getPrevPostByAuthorId',
    args: {
      id: 'ID',
      date: 'String',
      page: 'ID',
      perPage: 'ID'
    },
    type: [PostsTC],
    resolve: ({ args }) => {
      return PostsRepository.getPrevPost(args)
    }
  })

  PostsTC.addResolver({
    name: 'getNextPost',
    args: {
      date: 'String',
      page: 'ID',
      perPage: 'ID',
      filter: filterPostInput
    },
    type: PostsTC,
    resolve: ({ args }) => {
      return PostsRepository.getNextPost(args)
    }
  })

  PostsTC.addResolver({
    name: 'getPrevPost',
    args: {
      date: 'String',
      page: 'ID',
      perPage: 'ID',
      filter: filterPostInput
    },
    type: [PostsTC],
    resolve: ({ args }) => {
      return PostsRepository.getPrevPost(args)
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
    'tagsData', {
      resolver: () => TagTC.getResolver('getTagsByPostId'),
      prepareArgs: {
        id: (source) => source.id
      }
    }
  )

  PostsTC.addRelation(
    'categoryData', {
      resolver: () => CategoriesTC.getResolver('getCategoriesByPostId'),
      prepareArgs: {
        id: (source) => source.id
      }
    }
  )

  PostsTC.addRelation(
    'authorData', {
      resolver: () => UserTC.getResolver('getUserById'),
      prepareArgs: {
        id: (source) => source.author
      }
    }
  )

  PostsTC.addRelation(
    'mediaData', {
      resolver: () => MediaTC.getResolver('getMediaByParent'),
      prepareArgs: {
        id: (source) => source.id
      }
    }
  )

  schemaComposer.rootQuery().addFields({
    getPosts: PostsTC.getResolver('getPosts'),
    getPostById: PostsTC.getResolver('getPostById'),
    searchPosts: PostsTC.getResolver('searchPosts'),
    getPostBySlug: PostsTC.getResolver('getPostBySlug'),
    getPostsByAuthorId: PostsTC.getResolver('getPostsByAuthorId'),
    getPostsCount: PostsTC.getResolver('getPostsCount'),
    getNextPost: PostsTC.getResolver('getNextPost'),
    getPrevPost: PostsTC.getResolver('getPrevPost'),
    getNextPostByAuthorId: PostsTC.getResolver('getNextPostByAuthorId'),
    getPrevPostByAuthorId: PostsTC.getResolver('getPrevPostByAuthorId')

    // getPostsByCategoriesId: PostsTC.getResolver('getPostsByCategoriesId')
  })

  TC.PostsTC = PostsTC

  return PostsTC
}
