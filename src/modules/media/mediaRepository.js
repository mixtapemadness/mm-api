'use strict'
class MediasRepository {
  constructor(wp) {
    this.wp = wp
  }

  // mutate Obj to levelUp nested Fields Recieved From wp-Api
  MutateMediaObj(obj) {
    return Object.assign({}, obj, {
      guid: obj && obj.guid && obj.guid.rendered && obj.guid.rendered,
      title: obj.title.rendered,
      description: obj.description.rendered,
      caption: obj.caption.rendered,
      full:
        obj.media_details &&
        obj.media_details.sizes &&
        obj.media_details.sizes.full &&
        obj.media_details.sizes.full.source_url &&
        obj.media_details.sizes.full.source_url,

      featured_image:
        obj.media_details &&
        obj.media_details.sizes &&
        obj.media_details.sizes &&
        obj.media_details.sizes['featured-image'] &&
        obj.media_details.sizes['featured-image'].source_url
          ? obj.media_details.sizes['featured-image'].source_url
          : obj.media_details &&
            obj.media_details.sizes &&
            obj.media_details.sizes.full &&
            obj.media_details.sizes.full.source_url &&
            obj.media_details.sizes.full.source_url
    })
  }

  async getMedia() {
    try {
      const media = await this.wp.media()
      return media.map(item => this.MutateMediaObj(item))
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getMediaById(id) {
    try {
      if (id) {
        const media = await this.wp.media().id(id)
        return this.MutateMediaObj(media)
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async getMediaByParent(id) {
    try {
      const media = await this.wp.media().param('parent', id)
      return media.map(item => this.MutateMediaObj(item))
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

module.exports = MediasRepository
