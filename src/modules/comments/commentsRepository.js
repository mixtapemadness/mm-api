'use strict'
// const stripHtml = require('string-strip-html')

class CommentsRepository {
  constructor(wp) {
    this.wp = wp
  }
  async getCommentsByPostId(id) {
    const comments = await this.wp.comments()
      .param('post', id)
    return comments
  }

  async saveComments(id) {
    try {
      // return this.wp.comments().post({
      //   post: 7,
      //   author_email: 'test',
      //   author_name: 'test',
      //   content: 'test'
      // })
    } catch (e) {
      return Promise.reject(e)
    }
  }

}

module.exports = CommentsRepository

