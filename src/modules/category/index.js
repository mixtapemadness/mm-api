const getCategoryRepository = (wp) => {
  var CategoryRepository = require('./categoryRepository')
  return new CategoryRepository(wp)
}

const getGraphql = ({ db, TC, wp }) => {
  return require('./categoryGraphql')({
    CategoryRepository: getCategoryRepository(wp),
    TC
  })
}

module.exports = {
  getCategoryRepository,
  getGraphql,
  initModel: () => '',
  getRouteV1: () => ''
}

