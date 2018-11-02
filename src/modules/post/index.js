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

const getCtrl = (wp) => {
  var PostController = require('./postController')
  return new PostController(wp)
}

const getRouteV1 = (wp) => {
  let RouteV1 = require('./postRoutes.v1')
  return RouteV1({ ctrl: getCtrl(wp) })
}

module.exports = {
  getPostsRepository,
  getGraphql,
  initModel: () => '',
  getRouteV1
}

