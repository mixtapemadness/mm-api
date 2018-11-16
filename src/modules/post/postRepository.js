'use strict'
// const stripHtml = require('string-strip-html')
// var _ = require('lodash')

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

  // async getPostsCount({ filter = {} }) {
  //   const { categories, tags, author, slug } = filter
  //   const count = await this.wp.posts()
  //     .param('categories', categories)
  //     .param('tags', tags)
  //     .param('authors', author)
  //     .param('slug', slug)
  //   return Object.assign({}, { count: count._paging.total })
  // }

  async getPostsCount({ filter = {} }) {
    const { categories, tags, author, slug } = filter
    const count = await this.wp.posts()
    .param('categories', categories)
    .param('tags', tags)
    .param('authors', author)
    .param('slug', slug)
    .headers()
    return Object.assign({}, { count: count['x-wp-total'] })
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

  async getPostsByTags({tags}) {
    try {
      const posts = await this.wp.posts().param('tags', tags)
      const newPosts = posts.map(item => this.MutatePostObj(item))
      return newPosts
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getPostsByAuthorId({ id, page, perPage }) {
    try {
      const posts = await this.wp.posts()
        .author(id)
        .perPage(perPage)
        .page(page)
      return posts.map(item => this.MutatePostObj(item))
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getNextPostByAuthorId({ id, date, page, perPage }) {
    try {
      const post = await this.wp.posts()
      .author(id)
      .before(date)
      .perPage(perPage)
      .page(page)
      const newPost = this.MutatePostObj(post[0])
      return newPost
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getPrevPostByAuthorId({id, date, page, perPage}) {
    try {
      const posts = await this.wp.posts()
      .param('author', id)
      .after(date)
      .order('asc')
      .perPage(perPage)
      .page(page)
      const newPost = posts.map(item => this.MutatePostObj(item))
      return newPost
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

  async getNextPost({ date, page, perPage, filter = {} }) {
    const { categories } = filter
    try {
      const post = await this.wp.posts()
      .param('categories', categories)
      .before(date)
      .perPage(perPage)
      .page(page)
      const newPost = this.MutatePostObj(post[0])
      return newPost
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getPrevPost({date, page, perPage, filter = {}}) {
    const { categories } = filter
    try {
      if (date) {
        const posts = await this.wp.posts()
      .param('categories', categories)
      .after(date)
      .order('asc')
      .perPage(perPage)
      .page(page)
        const newPost = posts.map(item => this.MutatePostObj(item))
        return newPost
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

module.exports = PostRepository

