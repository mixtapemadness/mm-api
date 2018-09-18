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
      caption: obj.caption.rendered,
      imgs: {
        featured_image: obj.media_details.sizes['featured-image'].source_url,
        full: obj.media_details.sizes.full.source_url
      }
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
      // const media = await this.wp.media().param('parent', id)
      // return media.map(item => this.MutateMediaObj(item))
      const jsonData = [{
        id: 1,
        name: 'evgeni',
        url: 'google.com',
        description: 'zorba',
        link: 'facebook.com',
        slug: 'evgeni-slug',
        avatar1: 'avatar1',
        avatar2: 'avatar2',
        avatar3: 'avatar3',
        meta: 'meta',
        imgs: {
          featured_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNjGJwHETR_8pmg-E9Y8lxMm2LzRl4RVwhi0f97lvwi1r_z4T9'
        }
      }]
      return Promise.resolve(jsonData)
    } catch (e) {
      console.log('e', e)
    }
  }
}

module.exports = MediasRepository
