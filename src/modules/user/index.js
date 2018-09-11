const getUserRepository = (wp) => {
  var UserRepository = require('./userRepository')
  return new UserRepository(wp)
}

const getGraphql = ({ db, TC, wp }) => {
  return require('./userGraphql')({
    TC,
    UserRepository: getUserRepository(wp)
  })
}

module.exports = {
  getUserRepository,
  getGraphql,
  initModel: () => '',
  getRouteV1: () => ''
}

