'use strict'

const artistDetailsRepository = (db) => {
  const ArtistDetailsRepository = require('./artistDetailsRepository')
  return new ArtistDetailsRepository(db)
}

const getGraphql = ({ db, TC }) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')

  return require('./artistDetailsGraphql')({
    artistDetailsModel: db.artistDetailsModel,
    artistDetailsRepository: artistDetailsRepository(db),
    isAuthenticated,
    TC,
    db
  })
}

const getCtrl = (db) => {
  var ArtistDetailsController = require('./artistDetailsController')
  return new ArtistDetailsController({db, artistDetailsRepository: ArtistDetailsController(db)})
}

const getRouteV1 = (db) => {
  let RouteV1 = require('./artistDetailsRoutes.v1')
  return RouteV1({ ctrl: getCtrl(db) })
}

const artistDetailsModel = (db, mongoose) => {
  return require('./artistDetailsModel')(mongoose)
}

module.exports = {
  artistDetailsModel,
  artistDetailsRepository,
  getGraphql,
  getRouteV1,
  initModel: (db, mongoose) => {
    db.artistDetailsModel = require('./artistDetailsModel')(mongoose)
  }
}
