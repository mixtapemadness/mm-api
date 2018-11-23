/* eslint max-len: 0 */
/* eslint standard/object-curly-even-spacing: 0 */
var config = require('app/config')

class PostController {
  constructor(wp) {
    this.wp = wp
  }

  async share (req, res) {
    const slug = req.params.slug
    const category = req.params.category
    try {
      var noHTML = /(<([^>]+)>)/ig
      const post = await this.wp.posts().param('slug', slug)
      const media = await this.wp.media().id(post[0].featured_media)
      const title = post[0].title.rendered.replace(noHTML, '')
      const img = media.media_details.sizes['featured-image'].source_url
      const description = post[0].excerpt.rendered.replace(noHTML, '')

      res.render('postShare', { url: config.HTTP_HOST, frontUrl: config.front_url, description, title, img, category, slug})
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

module.exports = PostController
