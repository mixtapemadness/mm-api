const ActivityRouteV1 = require('./activityLogRoutes.v1')

module.exports = {
  getRouteV1: function() {
    return ActivityRouteV1
  },
  ActivityLogModel: require('./activityModel')
}
