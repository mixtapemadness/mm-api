'use strict'

const artistsCategoryRepository = (db) => {
  const ArtistsCategoryRepository = require('./artistCategorysRepository')
  return new ArtistsCategoryRepository(db)
}

const getGraphql = ({ db, TC }) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')

  return require('./artistCategorysGraphql')({
    artistDetailsModel: db.artistDetailsModel,
    artistDetailsRepository: artistsCategoryRepository(db),
    isAuthenticated,
    TC,
    db
  })
}

const getCtrl = (db) => {
  var artistsCategory = require('./artistCategorysController')
  return new artistsCategoryController({db, artistsCategoryRepository: artistsCategoryRepository(db)})
}

const getRouteV1 = (db) => {
  let RouteV1 = require('./artistCategorysRoutes.v1')
  return RouteV1({ ctrl: getCtrl(db) })
}

const artistDetailsModel = (db, mongoose) => {
  return require('./artistCategorysModel')(mongoose)
}

module.exports = {
  artistDetailsModel,
  artistsCategoryRepository,
  getGraphql,
  getRouteV1,
  initModel: (db, mongoose) => {
    db.artistsCategoryModel = require('./artistCategorysModel')(mongoose)
  }
}
