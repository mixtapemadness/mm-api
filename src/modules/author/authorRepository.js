'use strict'
class AuthorRepository {
  constructor(wp) {
    this.wp = wp
  }

  // mutate Obj to levelUp nested Fields Recieved From wp-Api
  mutateAuthorObj(obj) {
    return Object.assign({}, obj, {
      avatar1: obj.avatar_urls['24'],
      avatar2: obj.avatar_urls['48'],
      avatar3: obj.avatar_urls['96']
    })
  }

  async getAuthors() {
    try {
      const authors = await this.wp.users()
      const newAuthors = authors.map(item => this.mutateAuthorObj(item))
      return newAuthors
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getAuthorById(id) {
    try {
      const author = await this.wp.users().id(id)
      const newAuthor = await this.mutateAuthorObj(author)
      return newAuthor
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getAuthorBySlug(slug) {
    try {
      const author = await this.wp.users().param('slug', slug)
      const newAuthor = this.mutateAuthorObj(author[0])
      return newAuthor
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

module.exports = AuthorRepository
