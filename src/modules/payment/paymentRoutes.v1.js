module.exports = ({ isAuthenticated, ctrl }) => {
  return {
    '/api/v1/payments': {
      '/transaction/:token': { get: [ctrl.transaction.bind(ctrl)] },
      '/preapproved/:token': { get: [ctrl.preapprove.bind(ctrl)] },
      '/subscription-confirmed': { get: [ctrl.subscriptionConfirmed.bind(ctrl)] },
      '/webhooks': { post: [ctrl.webhooks.bind(ctrl)] },
      '/create-customer': { get: [ctrl.createCustomer.bind(ctrl)] },
      '/update-customer': { get: [ctrl.updateCustomer.bind(ctrl)] }
    }
  }
}
