'use strict'
// const stripHtml = require('string-strip-html')

class PostRepository {
  constructor(wp) {
    this.wp = wp
  }

  trim(item) {
    const regex = /(<([^>]+)>)/ig
    return item.replace(regex, '')
  }

  MutatePostObj(obj) {
    return Object.assign({}, obj, {
      guid: obj.guid.rendered,
      title: obj.title.rendered,
      content: obj.content.rendered,
      excerpt: obj.excerpt.rendered
    })
  }

  async getPosts({ filter = {}, sort = {}, page, perPage }) {
    const { categories, tags, author, slug } = filter
    const { order, orderBy } = sort
    try {
      const posts = await this.wp.posts()
        .param('categories', categories)
        .param('tags', tags)
        .param('authors', author)
        .param('slug', slug)
        .order(order).orderby(orderBy)
        .perPage(perPage).page(page)
      return posts.map(item => this.MutatePostObj(item))
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async searchPosts({ filter = {}, page, perPage }) {
    const { categories, tags, author, slug } = filter
    const { search } = filter
    try {
      const posts = await this.wp.posts()
        .param('categories', categories)
        .param('tags', tags)
        .param('authors', author)
        .param('slug', slug)
        .search(search)
        .perPage(perPage).page(page)
      return posts.map(item => this.MutatePostObj(item))
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getPostById(id) {
    try {
      const post = await this.wp.posts().id(id)
      const newPost = this.MutatePostObj(post)
      return newPost
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getPostBySlug(slug) {
    try {
      const post = await this.wp.posts().param('slug', slug)
      const newPost = this.MutatePostObj(post[0])
      return newPost
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getPostsByAuthorId(id) {
    try {
      const posts = await this.wp.posts().param('author', id)
      return posts.map(item => this.MutatePostObj(item))
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getPostsByCategoriesId(id) {
    try {
      const posts = await this.wp.posts().param('categories', id)
      return posts.map(item => this.MutatePostObj(item))
    } catch (e) {
      return Promise.reject(e)
    }
  }

}

module.exports = PostRepository

