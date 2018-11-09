const getAuthorRepository = (wp) => {
  var AuthorRepository = require('app/modules/author/authorRepository')
  return new AuthorRepository(wp)
}

const getGraphql = ({ db, TC, wp }) => {
  return require('app/modules/author/authorGraphql')({
    TC,
    AuthorRepository: getAuthorRepository(wp)
  })
}

module.exports = {
  getAuthorRepository,
  getGraphql,
  initModel: () => '',
  getRouteV1: () => ''
}

