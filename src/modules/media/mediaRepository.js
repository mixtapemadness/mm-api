'use strict'
class MediasRepository {
  constructor(wp) {
    this.wp = wp
  }

  // mutate Obj to levelUp nested Fields Recieved From wp-Api
  MutateMediaObj(obj) {
    return Object.assign({}, obj, {
      guid: obj.guid.rendered,
      title: obj.title.rendered,
      description: obj.description.rendered,
      caption: obj.caption.rendered
    })
  }

  async getMedia() {
    try {
      const media = await this.wp.media()
      return media.map(item => this.MutateMediaObj(item))
    } catch (e) {
      console.log('e', e)
    }
  }

  async getMediaByParent(id) {
    try {
      const media = await this.wp.media().param('parent', id)
      return media.map(item => this.MutateMediaObj(item))
    } catch (e) {
      console.log('e', e)
    }
  }
}

module.exports = MediasRepository