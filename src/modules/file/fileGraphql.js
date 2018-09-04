'use strict'

const {
  composeWithMongoose
} = require('graphql-compose-mongoose/node8')
const {
  GraphQLUpload
} = require('apollo-upload-server')
const {
  isAuthenticated,
  attachToAll
} = require('../core/graphql')

module.exports = ({
  FileModel,
  TC,
  fileRepository
}) => {
  const { schemaComposer } = TC

  const FileTC = composeWithMongoose(FileModel, {})

  FileTC.addResolver({
    name: 'upload',
    args: {
      files: [GraphQLUpload]
    },
    type: [FileTC],
    resolve: ({ context: { user }, args }) =>
      fileRepository.upload(
        Object.assign({}, args, { user })
      )
  })

  FileTC.addResolver({
    name: 'removeByName',
    args: {
      filename: FileTC.getFieldType('filename')
    },
    type: [FileTC],
    resolve: ({ context: { user }, args }) =>
      fileRepository.removeFile(args)
  })

  schemaComposer
    .rootMutation()
    .addFields({
      ...attachToAll(isAuthenticated)({
        upload: FileTC.getResolver('upload'),
        fileRemoveByName: FileTC.getResolver('removeByName')
      })
    })

  TC.FileTC = FileTC

  return FileTC
}
