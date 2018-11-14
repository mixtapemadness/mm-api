'use strict'

const artistsCategoryRepository = (db) => {
  const ArtistsCategoryRepository = require('./artistsCategoryRepository')
  return new ArtistsCategoryRepository(db)
}

const getGraphql = ({ db, TC }) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')

  return require('./artistsCategoryGraphql')({
    artistDetailsModel: db.artistDetailsModel,
    artistDetailsRepository: artistsCategoryRepository(db),
    isAuthenticated,
    TC,
    db
  })
}

const getCtrl = (db) => {
  var artistsCategory = require('./artistsCategoryController')
  return new artistsCategoryController({db, artistsCategoryRepository: artistsCategoryRepository(db)})
}

const getRouteV1 = (db) => {
  let RouteV1 = require('./artistsCategoryRoutes.v1')
  return RouteV1({ ctrl: getCtrl(db) })
}

const artistDetailsModel = (db, mongoose) => {
  return require('./artistsCategoryModel')(mongoose)
}

module.exports = {
  artistDetailsModel,
  artistsCategoryRepository,
  getGraphql,
  getRouteV1,
  initModel: (db, mongoose) => {
    db.artistsCategoryModel = require('./artistsCategoryModel')(mongoose)
  }
}
