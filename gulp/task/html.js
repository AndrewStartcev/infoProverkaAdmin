const { src, dest } = require('gulp');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const htmlBeautify = require('gulp-html-beautify');
const fileInclude = require('gulp-file-include');
const size = require('gulp-size');
const path = require('../config/path.js');

const html = () => {
  return src(path.html.src)
    .pipe(
      plumber({ errorHandler: notify.onError({ title: 'HTML', message: '<%= error.message %>' }) }),
    )
    .pipe(size({ title: 'src.html' }))
    .pipe(fileInclude())
    .pipe(
      htmlBeautify({
        indent_size: 2,
        indent_char: ' ',
        unformatted: ['code', 'pre', 'em', 'strong'],
        extra_liners: ['head', 'body', '/html'],
      }),
    )
    .pipe(size({ title: 'public.html' }))
    .pipe(dest(path.html.dest));
};

module.exports = html;
