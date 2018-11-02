
var config = require('app/config')
var striptags = require('striptags')

class PostController {
  constructor(wp) {
    this.wp = wp
  }

  async share (req, res) {
    const slug = req.params.slug
    const category = req.params.category
    try {
      const post = await this.wp.posts().param('slug', slug)
      // console.log('post', post)
      const media = await this.wp.media().id(post[0].featured_media)
      const title = post[0].title.rendered
      const img = media.media_details.sizes['featured-image'].source_url
      const description = striptags(post[0].excerpt.rendered)
      res.render('postShare', { url: config.HTTP_HOST, frontUrl: config.front_url, description, title, img, category, slug})
      // const newPost = this.MutatePostObj(post[0])
      // return newPost
    } catch (e) {
      return Promise.reject(e)
    }

    // .then((user) => {
    //   let desc
    //   let avatar
    //   if (user.description) {
    //     desc = user.description
    //     // desc = desc.replace(/<\/?[^>]+(>|$)/g, '')
    //     desc = desc.replace(/(?:&nbsp;|<br \/>|<\/?[^>]+(>|$))/g, '')
    //     if (!desc && user.category && user.category.length > 0 && user.location) {
    //       desc = `Category - ${user.category.join()}, Location - ${user.location}`
    //     }
    //   } else if (user.category && user.category.length > 0 && user.location) {
    //     desc = `Category - ${user.category.join()}, Location - ${user.location}`
    //   } else {
    //     desc = ''
    //   }
    //   avatar = user.avatar.startsWith('http') ? user.avatar : `${config.HTTP_HOST}/avatars/${user.avatar}`
    //   res.render('user', {user, description: desc, url: config.HTTP_HOST, frontUrl: config.front_url, avatar})
    // })
    // .catch(() => {
    //   return res.notFound('Item not found!')
    // })
  }

}

module.exports = PostController
