const { src, dest } = require('gulp');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const newer = require('gulp-newer');
const size = require('gulp-size');
const path = require('../config/path.js');

const js = () => {
  return src(path.js.src)
    .pipe(
      plumber({ errorHandler: notify.onError({ title: 'JS', message: '<%= error.message %>' }) }),
    )
    .pipe(newer(path.js.dest))
    .pipe(size({ title: 'js copy' }))
    .pipe(dest(path.js.dest));
};

module.exports = js;
