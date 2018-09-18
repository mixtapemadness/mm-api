/* eslint max-len: 0 */
'use strict'
const stripHtml = require('string-strip-html')

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
      title: stripHtml(obj.title.rendered),
      content: stripHtml(obj.content.rendered),
      excerpt: stripHtml(obj.excerpt.rendered)
    })
  }

  async getPosts({ filter = {}, sort = {}, page, perPage }) {
    const jsonData = [
      {
        id: 1,
        date: 'zeg',
        date_gmt: 'mazeg',
        link: 'google.com',
        name: 'anri',
        slug: 'anri-jokhadze',
        guid: 2,
        type: 3,
        title: 'burkina faso',
        content: 'come to burkina faso, its good',
        excerpt: 'ubagaba',
        featured_media: 3,
        format: 'news',
        meta: 'meta',
        author: {
          id: 1,
          name: 'evgeni',
          url: 'google.com',
          description: 'zorba',
          link: 'facebook.com',
          slug: 'evgeni-slug',
          avatar1: 'avatar1',
          avatar2: 'avatar2',
          avatar3: 'avatar3',
          meta: 'meta'
        },
        tags: ['ufleba', 'ar', 'maq', 'movide'],
        category: 'news'
      },
      {
        id: 2,
        date: 'zeg',
        date_gmt: 'mazeg',
        link: 'google.com',
        name: 'anri',
        slug: 'anri-jokhadze',
        guid: 2,
        type: 3,
        title: 'burkina faso',
        content: 'come to burkina faso, its good',
        excerpt: 'ubagaba',
        featured_media: 3,
        format: 'news',
        meta: 'meta',
        author: {
          id: 1,
          name: 'evgeni',
          url: 'google.com',
          description: 'zorba',
          link: 'facebook.com',
          slug: 'evgeni-slug',
          avatar1: 'avatar1',
          avatar2: 'avatar2',
          avatar3: 'avatar3',
          meta: 'meta'
        },
        tags: ['ufleba', 'ar', 'maq', 'movide'],
        category: 'news'
      },
      {
        id: 3,
        date: 'zeg',
        date_gmt: 'mazeg',
        link: 'google.com',
        name: 'anri',
        slug: 'anri-jokhadze',
        guid: 2,
        type: 3,
        title: 'burkina faso',
        content: 'come to burkina faso, its good',
        excerpt: 'ubagaba',
        featured_media: 3,
        format: 'news',
        meta: 'meta',
        tags: ['ufleba', 'ar', 'maq', 'movide'],
        category: 'news'
      }
    ]

    // const { categories, tags, author, search, slug } = filter
    // const { order, orderBy } = sort
    // try {
    //   const posts = await this.wp.posts()
    //     .param('categories', categories)
    //     .param('tags', tags)
    //     .param('authors', author)
    //     .param('slug', slug)
    //     .order(order).orderby(orderBy)
    //     .perPage(perPage).page(page)
    //     .search(search)
    try {
      // console.log('json', json)
      // const newJsonData = jsonData.map(item => this.MutatePostObj(item))
      return Promise.resolve(jsonData)
    } catch (e) {
      console.log('e', e)
    }
  }

  async getPostById(id) {
    try {
      const post = await this.wp.posts().id(id)
      const newPost = this.MutatePostObj(post)
      return newPost
    } catch (e) {
      console.log('e', e)
    }
  }

  async getPostsByCategoriesId(id) {
    try {
      const posts = await this.wp.posts().param('categories', id)
      return posts.map(item => this.MutatePostObj(item))
    } catch (e) {
      console.log('e', e)
    }
  }

}

module.exports = PostRepository

