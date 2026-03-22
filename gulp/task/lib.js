const { src, dest } = require('gulp');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const newer = require('gulp-newer');
const size = require('gulp-size');
const path = require('../config/path.js');

const lib = () => {
  return src(path.lib.src)
    .pipe(
      plumber({ errorHandler: notify.onError({ title: 'Lib', message: '<%= error.message %>' }) }),
    )
    .pipe(newer(path.lib.dest))
    .pipe(size({ title: 'lib copy' }))
    .pipe(dest(path.lib.dest));
};

module.exports = lib;
