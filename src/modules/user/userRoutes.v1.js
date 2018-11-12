module.exports = ({ isAuthenticated, UserCtrl, AuthCtrl }) => {
  return {
    '/api/v1/users': {
      '/activate/:token': { get: [AuthCtrl.activateAccount.bind(AuthCtrl)] }
    }
  }
}
