"use strict"

var gulp        = require('gulp');
var babel       = require('gulp-babel');
var insert      = require('gulp-insert');
var rename      = require('gulp-rename');
var jasmine     = require('gulp-jasmine');
var runSequence = require('run-sequence');
var fs          = require('fs');
var path        = require('path');
var del         = require('del');
var ts          = require("gulp-typescript");

gulp.task('default', ['test']);

gulp.task('clean', function(cb) { del('./dist', cb); });

gulp.task('build', function(cb) {
  runSequence(
    'clean',
    ['build-sizzle', 'build-ts'],
    cb
  );
});

gulp.task('build-ts', function() {
  var tsconfig = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'tsconfig.json'))
  );
  var opts = tsconfig.compilerOptions;
  opts.typescript = require('typescript');

  return gulp.src(tsconfig.filesGlob)
     .pipe(ts(opts))
     .pipe(gulp.dest("./dist"));
});

gulp.task('build-sizzle', function () {
  var content = fs.readFileSync('./lib/sizzle.js');
  return gulp.src('./lib/sizzle-bundle.js')
    .pipe(insert.transform(function(s) {return s.replace('CONTENT', content)}))
    .pipe(gulp.dest('./src'))
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
