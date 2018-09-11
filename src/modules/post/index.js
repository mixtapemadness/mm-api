const getPostsRepository = (wp) => {
  var PostRepository = require('./postRepository')
  return new PostRepository(wp)
}

const getGraphql = ({ db, TC, wp }) => {
  return require('./postGraphql')({
    BookingModel: db.BookingModel,
    TC,
    PostsRepository: getPostsRepository(wp)
  })
}

module.exports = {
  getPostsRepository,
  getGraphql,
  initModel: () => '',
  getRouteV1: () => ''
}

