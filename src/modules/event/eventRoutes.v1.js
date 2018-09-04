
module.exports = ({ isAuthenticated, ctrl }) => {
  return {
    '/api/v1/event': {
      get: [isAuthenticated, ctrl.listEvent.bind(ctrl)],
      post: [isAuthenticated, ctrl.createEvent.bind(ctrl)],
      '/:id': {
        get: [isAuthenticated, ctrl.listEvent.bind(ctrl)],
        delete: [isAuthenticated, ctrl.deleteEvent.bind(ctrl)],
        put: [isAuthenticated, ctrl.editEvent.bind(ctrl)]
      }
    }
  }
}
