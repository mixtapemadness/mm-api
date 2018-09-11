const getMediaRepository = (wp) => {
  var MediaRepository = require('./mediaRepository')
  return new MediaRepository(wp)
}

const getGraphql = ({ db, TC, wp }) => {
  return require('./mediaGraphql')({
    TC,
    MediaRepository: getMediaRepository(wp)
  })
}

module.exports = {
  getMediaRepository,
  getGraphql,
  initModel: () => '',
  getRouteV1: () => ''
}

