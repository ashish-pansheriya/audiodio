var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var flatten = require('gulp-flatten');

var config = require('./config');
var argv = require('yargs').argv;
var ngConstant = require('gulp-ng-constant');
var merge = require('merge-stream');

var paths = {
  sass: ['./scss/**/*.scss']
};
gulp.task('build', function () {
  var user = argv.user || 'will'; //default

  var constantsStream = ngConstant({
    name: 'audiodio.constants',
    constants: config.usernames[user],
    stream: true
  });
  var appStream = gulp.src('./www/app/**/*.js');

  return merge(appStream, constantsStream)
    .pipe(concat('audiodio.js'))
    .pipe(gulp.dest('./www/'));
});
gulp.task('default', ['sass', 'build']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

