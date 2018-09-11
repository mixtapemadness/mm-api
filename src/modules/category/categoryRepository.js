'use strict'
class CategoriesRepository {
  constructor(wp) {
    this.wp = wp
  }

  getCategories() {
    try {
      return this.wp.categories()
    } catch (e) {
      console.log('e', e)
    }
  }

  getCategoriesByPostId(id) {
    try {
      return this.wp.categories().param('post', id)
    } catch (e) {
      console.log('e', e)
    }
  }

}

module.exports = CategoriesRepository
