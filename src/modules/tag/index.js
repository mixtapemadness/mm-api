const getTagRepository = (wp) => {
  var TagRepository = require('./tagRepository')
  return new TagRepository(wp)
}

const getGraphql = ({ db, TC, wp }) => {
  return require('./tagGraphql')({
    TagRepository: getTagRepository(wp),
    TC
  })
}

module.exports = {
  getTagRepository,
  getGraphql,
  initModel: () => '',
  getRouteV1: () => ''
}

