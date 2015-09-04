"use strict"

var gulp        = require('gulp');
var babel       = require('gulp-babel');
var insert      = require('gulp-insert');
var rename      = require('gulp-rename');
var jasmine     = require('gulp-jasmine');
var runSequence = require('run-sequence');
var fs          = require('fs');
var del         = require('del');

gulp.task('default', ['build']);

gulp.task('clean', function(cb) { del('./dist', cb); });

gulp.task('build', function(cb) {
  runSequence(
    'clean',
    ['build-main', 'build-sizzle'],
    cb
  );
});

gulp.task('build-main', function() {
  return gulp.src('./src/*.jsx')
    .pipe(babel())
    .pipe(gulp.dest('./dist'));
});

gulp.task('build-sizzle', function () {
  var content = fs.readFileSync('./lib/sizzle.js');
  return gulp.src('./lib/sizzle-bundle.js')
    .pipe(insert.transform(function(s) {return s.replace('CONTENT', content)}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build-test', ['build'], function() {
  return gulp.src('./test/*.jsx')
    .pipe(babel())
    .pipe(rename({prefix: 'test-'}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('test', ['build-test'], function () {
  return gulp.src('dist/test-*.js')
    .pipe(jasmine({verbose: true, includeStackTrace: true}));
});
