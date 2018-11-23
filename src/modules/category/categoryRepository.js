'use strict'
class CategoriesRepository {
  constructor(wp) {
    this.wp = wp
  }

  getCategories() {
    try {
      return this.wp.categories()
    } catch (e) {
      return Promise.reject(e)
    }
  }

  getCategoryByID(id) {
    try {
      return this.wp.categories().id(id)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  getCategoriesByPostId(id) {
    try {
      return this.wp.categories().param('post', id)
    } catch (e) {
      return Promise.reject(e)
    }
  }

}

module.exports = CategoriesRepository
