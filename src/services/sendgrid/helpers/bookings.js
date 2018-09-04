const config = require('../../../config')

module.exports = {
  stars (rating) {
    var res = []

    for (var i = 1; i < 6; i++) {
      if (rating < i) {
        res.push(`${config.back_url}/assets/img/star-gray.png`)
      } else {
        res.push(`${config.back_url}/assets/img/star-yellow.png`)
      }
    }

    return res
  }
}
