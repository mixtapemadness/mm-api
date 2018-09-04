const getFileRepository = (db) => {
  var FileRepository = require('./fileRepository')
  return new FileRepository({db})
}

const getGraphql = ({db, TC}) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')
  return require('./fileGraphql')({
    FileModel: db.FileModel,
    isAuthenticated,
    fileRepository: getFileRepository(db),
    TC
  })
}

module.exports = {
  getGraphql, // TODO: NOTE: temp returns null
  getRouteV1: (db) => null,
  initModel: (db, mongoose) => {
    db.FileModel = require('./fileModel')(mongoose)
  }

}
