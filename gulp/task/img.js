const { src, dest } = require('gulp');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const newer = require('gulp-newer');
const size = require('gulp-size');
const path = require('../config/path.js');

const img = () => {
  return src(path.img.src)
    .pipe(
      plumber({ errorHandler: notify.onError({ title: 'IMG', message: '<%= error.message %>' }) }),
    )
    .pipe(newer(path.img.dest))
    .pipe(size({ title: 'img copy' }))
    .pipe(dest(path.img.dest));
};

module.exports = img;
