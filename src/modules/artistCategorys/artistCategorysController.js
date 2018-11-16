'use strict'
class artistCategorysController {
  constructor ({ db, artistCategorysRepo }) {
    this.db = db
    this.artistCategorysRepo = artistCategorysRepo
  }
}

module.exports = artistCategorysController
