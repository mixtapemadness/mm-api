/* eslint max-len: 0 */
/* eslint standard/object-curly-even-spacing: 0 */
var config = require('app/config')
const stripHtml = require('string-strip-html')

class PostController {
  constructor(wp) {
    this.wp = wp
  }

  async share (req, res) {
    const slug = req.params.slug
    const category = req.params.category
    try {
      const post = await this.wp.posts().param('slug', slug)
      const media = await this.wp.media().id(post[0].featured_media)
      const unStrippedTitle = post[0].title.rendered
      const title = stripHtml(unStrippedTitle)
      const img = media.media_details.sizes['featured-image'].source_url
      const description = post[0].excerpt.rendered
      res.render('postShare', { url: config.HTTP_HOST, frontUrl: config.front_url, description, title, img, category, slug})
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

module.exports = PostController
