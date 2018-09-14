'use strict'

module.exports = ({ MediaRepository, TC }) => {
  const {
    schemaComposer,
    TypeComposer
  } = TC

  const MediaTC = TypeComposer.create({
    name: 'MediaType',
    fields: {
      id: 'ID',
      date: 'String',
      date_gmt: 'String',
      guid: 'String',
      modified: 'String',
      modified_gmt: 'String',
      slug: 'String',
      status: 'String',
      type: 'String',
      link: 'String',
      title: 'String',
      author: 'ID',
      comment_status: 'String',
      ping_status: 'String',
      template: 'String',
      meta: ['String'],
      description: 'String',
      caption: 'String',
      alt_text: 'String',
      media_type: 'String',
      mime_type: 'String',
      post: 'ID',
      imgs: `type ImgsType {
        featured_image: String
        full:String
      }`
    }
  })

  MediaTC.addResolver({
    name: 'getMedia',
    args: {},
    type: [MediaTC],
    resolve: ({ source, args }) => {
      return MediaRepository.getMedia()
    }
  })

  MediaTC.addResolver({
    name: 'getMediaByParent',
    args: { id: 'ID' },
    type: [MediaTC],
    resolve: ({ args }) => {
      return MediaRepository.getMediaByParent(args.id)
    }
  })

  schemaComposer.rootQuery().addFields({
    getMedia: MediaTC.getResolver('getMedia'),
    getMediaByParent: MediaTC.getResolver('getMediaByParent')
  })

  TC.MediaTC = MediaTC

  return MediaTC
}
