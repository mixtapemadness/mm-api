const getUerRepository = (db) => {
  var UserRepository = require('./userRepository')
  return new UserRepository({db})
}

const getAuthRepository = (db) => {
  var AuthRepository = require('./authRepository')
  return new AuthRepository({db})
}

const getAuthCtrl = (db) => {
  var AuthController = require('./authController')
  return new AuthController({ db,
    authRepository: getAuthRepository(db)
  })
}

const getUserCtrl = (db) => {
  var UserController = require('./userController')
  return new UserController({db,
    userRepository: getUerRepository(db),
    authRepository: getAuthRepository(db)})
}

const getRouteV1 = (db) => {
  var isAuthenticated = require('../../policies/isAuthenticated')
  let RouteV1 = require('./userRoutes.v1')
  return RouteV1({ isAuthenticated, UserCtrl: getUserCtrl(db), AuthCtrl: getAuthCtrl(db) })
}

const getGraphql = ({db, TC}) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')
  return require('./userGraphql')({
    UserModel: db.UserModel,
    isAuthenticated,
    userRepository: getUerRepository(db),
    authRepository: getAuthRepository(db),
    TC
  })
}

module.exports = {
  getUserCtrl,
  getAuthCtrl,
  getAuthRepository,
  getUerRepository,
  getRouteV1: getRouteV1,
  getGraphql: getGraphql, // TODO: NOTE: temp returns null
  getRoute: (db) => null,
  initModel: (db, mongoose) => {
    db.UserModel = require('./userModel')(mongoose)
  }

}
