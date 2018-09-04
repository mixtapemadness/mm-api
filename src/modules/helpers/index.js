// let RouteV1 = require('./helperRoute.v1')

// module.exports = {
//   getRouteV1: () => {
//     return RouteV1
//   }
// }

const getRepository = (db) => {
  var HelperRepository = require('./helperRepository')

  return new HelperRepository({db})
}

const getCtrl = (db) => {
  var HelperController = require('./helperController')

  return new HelperController({ db, HelperRepository: getRepository(db) })
}

const getRouteV1 = (db) => {
  var isAuthenticated = require('../../policies/isAuthenticated')
  let RouteV1 = require('./helperRoute.v1')
  return RouteV1({ isAuthenticated, ctrl: getCtrl(db) })
}

const getGraphql = ({db, schemaComposer, TC}) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')
  require('./helperGraphql')({schemaComposer, isAuthenticated, TC})
}

module.exports = {
  getCtrl: getCtrl,
  getRepository: getRepository,
  getRouteV1: getRouteV1,
  getGraphql: getGraphql,
  getRoute: (db) => null,
  initModel: (db, mongoose) => {
    return null
    // NOTE: we don't have model for this
    // db.BookingModel = require('./bookingModel')(mongoose)
  }
}
