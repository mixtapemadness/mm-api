// NODE_ENV waiting production, development or testing
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

var gulp = require('gulp')
var rsync = require('gulp-rsync')
var prompt = require('gulp-prompt')
var gulpif = require('gulp-if')
var argv = require('minimist')(process.argv)
var debug = require('debug')('vobi')
var appConfig = require('app/config')

var config = appConfig.deployment

debug('config', config)

var deploymentFoldersSite = [
  '.'
]

gulp.task('deploy', function() {
  var rsyncPaths = deploymentFoldersSite
  var rsyncConf = {
    progress: true,
    incremental: true,
    relative: true,
    emptyDirectories: true,
    recursive: true,
    syncDest: true,
    // clean: true,
    exclude: [
       // 'EXLUDED_FOLDERS'
      './node_modules',
      '.notes',
      '.vscode',
      'public/uploads/images'
    ]
  }
  if (argv.production) {
    debug('PRODUCTION HOST ..:::... ', config.prod.host)
    rsyncConf.hostname = config.prod.host
    rsyncConf.username = config.prod.username
    rsyncConf.destination = '/home/ubuntu/mixtape_back' // path where uploaded files go
        // Missing/Invalid Target
  } else if (argv.test) {
    debug('DEVELOPMENT HOST ..:::... ', config.test.host)
    rsyncConf.hostname = config.test.host
    rsyncConf.username = config.test.username
    rsyncConf.destination = '/home/ubuntu/mixtape_back' // path where uploaded files go
  } else {
    // throwError('deploy', gutil.colors.red('Missing or invalid target'))
  }
    // Use gulp-rsync to sync the files
  return gulp.src(rsyncPaths)
        .pipe(gulpif(
            argv.production,
            prompt.confirm({
              message: 'Heads Up! Are you SURE you want to push to PRODUCTION?',
              default: false
            })
        ))
        .pipe(rsync(rsyncConf))
})
