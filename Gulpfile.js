// Gulpfile.js - We use Gulp to monitor our files and
// do two things when we make changes to the code:
// 1) check it for errors ("lint it") and 2) restart
// the application.

'use strict';

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');

gulp.task('lint', function () {
  gulp.src(['./**/*.js', '!./node_modules/**'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('develop', function () {
  nodemon({ script: 'start-app.js', ext: 'html js'})
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('restarted!');
    });
});

