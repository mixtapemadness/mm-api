'use strict'
class PostRepository {
  constructor(wp) {
    this.wp = wp
  }

  // mutate Obj to levelUp nested Fields Recieved From wp-Api
  MutatePostObj(obj) {
    return Object.assign({}, obj, {
      guid: obj.guid.rendered,
      title: obj.title.rendered,
      content: obj.content.rendered,
      excerpt: obj.excerpt.rendered
    })
  }

  async getPosts({ filter, sort = {}, page, perPage }) {
    const { categories, tags, author } = filter
    const { order, orderBy } = sort
    try {
      const posts = await this.wp.posts()
        .param('categories', categories)
        .param('tags', tags)
        .param('authors', author)
        .order(order).orderby(orderBy)
        .perPage(perPage).page(page)
      return posts.map(item => this.MutatePostObj(item))
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

