module.exports = ({ isAuthenticated, ctrl }) => {
  return {
    '/api/v1/chat': {
      '/ping': {
        get: [ctrl.ping.bind(ctrl)]
      },
      get: [isAuthenticated, ctrl.list.bind(ctrl)],
      post: [isAuthenticated, ctrl.send.bind(ctrl)],
      '/:id': {
        get: [isAuthenticated, ctrl.view.bind(ctrl)],
        delete: [isAuthenticated, ctrl.delete.bind(ctrl)],
        '/reply': {
          post: [isAuthenticated, ctrl.reply.bind(ctrl)]
        },
        '/deleteMessage': {
          post: [isAuthenticated, ctrl.deleteMessage.bind(ctrl)]
        }
      }
    }
  }
}
