process.env.NODE_ENV = process.env.NODE_ENV || 'development'
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
const requestIp = require('request-ip')

var app = express()
global.app = app

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true)
  // res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, authorization')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

app.set('superSecret', 'this$isThisfuckingsecret%^now')
app.use(requestIp.mw())
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/app/views'))

// app.use(bodyParser.json({limit: '10mb'}))
// app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/avatars', express.static(path.join(__dirname, 'src/public/uploads')))
app.use('/static/events-photos', express.static(path.join(__dirname, 'src/public/uploads')))
// app.use(upload)
// load config
app.set('configuration', require('app/config'))

// extend app for route object mapping
app.map = function (a, route) {
  route = route || ''
  for (var key in a) {
    if (Array.isArray(a[key])) {
      // get: [function(){ ... }]
      app[key](route, a[key])
    } else if (typeof a[key] === 'object') {
      // { '/path': { ... }}
      app.map(a[key], route + key)
    } else if (typeof a[key] === 'function') {
      // get: function(){ ... }
      app[key](route, a[key])
    }
  }
}

var debug = require('debug')('mixtape')
debug('Server run')

require('./src/modules')(app)

module.exports = app
