'use strict'

class TagRepository {
  constructor(wp) {
    this.wp = wp
  }

  getTags() {
    try {
      return this.wp.tags()
    } catch (e) {
      return Promise.reject(e)
    }
  }

  getTagById(id) {
    try {
      return this.wp.tags().id(id)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  getTagsByPostId(id) {
    try {
      const res = this.wp.tags().param('post', id)
      return res
    } catch (e) {
      return Promise.reject(e)
    }
  }

}

module.exports = TagRepository
