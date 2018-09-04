'use strict'

const getRepository = (db) => {
  var ReviewRepository = require('./reviewRepository')

  return new ReviewRepository({ db })
}

const getGraphql = ({ db, TC }) => {
  const { isAuthenticated } = require('../../policies/graphqlAuth')

  return require('./reviewGraphql')({
    ReviewModel: db.ReviewModel,
    isAuthenticated,
    TC
  })
}

module.exports = {
  getRepository: getRepository,
  getGraphql: getGraphql,
  getRouteV1: (db) => null,
  initModel: (db, mongoose) => {
    db.ReviewModel = require('./reviewModel')(mongoose)
  }
}
