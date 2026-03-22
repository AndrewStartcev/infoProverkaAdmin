const { src, dest } = require('gulp');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const newer = require('gulp-newer');
const size = require('gulp-size');
const path = require('../config/path.js');

const css = () => {
  return src(path.css.src)
    .pipe(
      plumber({
        errorHandler: notify.onError({ title: 'CSS copy', message: '<%= error.message %>' }),
      }),
    )
    .pipe(newer(path.css.dest))
    .pipe(size({ title: 'css copy' }))
    .pipe(dest(path.css.dest));
};

module.exports = css;
