module.exports = ({ isAuthenticated, ctrl }) => {
  return {
    '/api/v1/notifications': {
      get: [isAuthenticated, ctrl.listNotifications.bind(ctrl)],
      '/status': {
        post: [isAuthenticated, ctrl.setReadStatus.bind(ctrl)]
      },
      '/count-unread': {
        get: [isAuthenticated, ctrl.countUnreadNotifications.bind(ctrl)]
      },
      '/:id': {
        get: [isAuthenticated, ctrl.getNotification.bind(ctrl)],
        delete: [isAuthenticated, ctrl.deleteNotification.bind(ctrl)],
        put: [isAuthenticated, ctrl.editNotification.bind(ctrl)]
      }
    }
  }
}

