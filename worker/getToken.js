var shajs = require('sha.js')
const secretKey = 'thisonecouldbeapublicbutitsasecretkey'

module.exports = () => {
  const d = new Date()

  return shajs('sha256')
    .update(`${d.getMinutes()}${d.getMonth()}${d.getHours()}${d.getFullYear()}${secretKey}${d.getDate()}`)
    .digest('hex')
}
