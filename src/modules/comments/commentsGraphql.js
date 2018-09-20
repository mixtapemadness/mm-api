'use strict'

module.exports = ({ CommentsRepository, TC }) => {
  const {
    schemaComposer,
    TypeComposer
  } = TC

  const CommentsTC = TypeComposer.create({
    name: 'CommentsTC',
    fields: {
      id: 'ID!',
      tags: ['ID'],
      post: 'ID',
      parent: 'ID',
      author: 'ID',
      author_name: 'String',
      author_url: 'String',
      date: 'String',
      date_gmt: 'String',
      content: 'String',
      link: 'String',
      status: 'String',
      type: 'String',
      avatar1: 'String',
      avatar2: 'String',
      avatar3: 'String'
    }
  })

  CommentsTC.addResolver({
    name: 'getCommentsByPostId',
    args: {
      id: 'ID'
    },
    type: [CommentsTC],
    resolve: ({ source, args }) => {
      return CommentsRepository.getCommentsByPostId(args.id)
    }
  })

  CommentsTC.addResolver({
    name: 'SaveComment',
    args: {
      id: 'ID'
    },
    type: [CommentsTC],
    resolve: ({ source, args }) => {
      return CommentsRepository.saveCommnet(args.id)
    }
  })

  schemaComposer.rootQuery().addFields({
    getCommentsByPostId: CommentsTC.getResolver('getCommentsByPostId')
    // getPostsByCategoriesId: PostsTC.getResolver('getPostsByCategoriesId')
  })
  schemaComposer.rootMutation().addFields({
    SaveComment: CommentsTC.getResolver('SaveComment')
  })
  TC.CommentsTC = CommentsTC

  return CommentsTC
}
