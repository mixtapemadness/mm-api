const CommentsRepository = (wp) => {
  var CommentsRepository = require('app/modules/comments/commentsRepository')
  return new CommentsRepository(wp)
}

const getGraphql = ({ db, TC, wp }) => {
  return require('./commentsGraphql')({
    BookingModel: db.BookingModel,
    TC,
    CommentsRepository: CommentsRepository(wp)
  })
}

module.exports = {
  CommentsRepository,
  getGraphql,
  initModel: () => '',
  getRouteV1: () => ''
}

