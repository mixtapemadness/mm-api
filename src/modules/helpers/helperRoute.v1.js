// var HelperCtrl = require('./helperController')
// const isAuthenticated = require('../../policies/isAuthenticated')
// const isAuthenticatedTenant = require('../../policies/isAuthenticatedTenant')

// module.exports = {
//   '/api/v1/helpers': {
//     '/ping': {
//       get: [HelperCtrl.ping.bind(HelperCtrl)]
//     },
//     // '/upload-file': {
//     //   put: [isAuthenticated, HelperCtrl.uploadFile.bind(HelperCtrl)]
//     // },

//     '/roles': {
//       get: [isAuthenticated, HelperCtrl.getRoles.bind(HelperCtrl)]
//     },

//     '/upload-image': {
//       post: [isAuthenticatedTenant, HelperCtrl.uploadImage.bind(HelperCtrl.uploadImage)]
//     },
//     '/send-sms': {
//       post: [HelperCtrl.sendSms.bind(HelperCtrl)]
//     }

//   }
// }

module.exports = ({ isAuthenticated, ctrl }) => {
  return {
    '/api/v1/helpers': {
      '/ping': {
        get: [ctrl.ping.bind(ctrl)]
      },
      '/upload-image': {
        put: [isAuthenticated, ctrl.uploadImage.bind(ctrl)]
      },
      '/roles': {
        get: [isAuthenticated, ctrl.getRoles.bind(ctrl)]
      },
      '/send-sms': {
        post: [ctrl.sendSms.bind(ctrl)]
      }
    }
  }
}

