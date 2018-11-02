module.exports = ({ ctrl }) => {
  return {
    '/api/v1/blog': {
      '/:category': {
        '/:slug': {
          '/share': {
            get: [ctrl.share.bind(ctrl)]
          }
        }
      }
    }
  }
}
