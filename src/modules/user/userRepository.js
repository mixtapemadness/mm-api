'use strict'
class UserRepository {
  constructor(wp) {
    this.wp = wp
  }

  // mutate Obj to levelUp nested Fields Recieved From wp-Api
  MutateUserObj(obj) {
    return Object.assign({}, obj, {
      avatar1: obj.avatar_urls['24'],
      avatar2: obj.avatar_urls['48'],
      avatar3: obj.avatar_urls['96']
    })
  }

  async getUsers() {
    try {
      const users = await this.wp.users()
      const newUser = users.map(item => this.MutateUserObj(item))
      return newUser
    } catch (e) {
      console.log('e', e)
    }
  }

  async getUserById(id) {
    try {
      const user = await this.wp.users().id(id)
      const newUser = this.MutateUserObj(user)
      return newUser
    } catch (e) {
      console.log('e', e)
    }
  }

  async getUserBySlug(slug) {
    try {
      const user = await this.wp.users().param('slug', slug)
      const newUser = this.MutateUserObj(user)
      return newUser
    } catch (e) {
      console.log('e', e)
    }
  }

}

module.exports = UserRepository
