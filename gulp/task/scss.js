const { src, dest } = require('gulp');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const size = require('gulp-size');
const postcss = require('gulp-postcss');

const combineDuplicatedSelectors = require('postcss-combine-duplicated-selectors');
const mergeRules = require('postcss-merge-rules');

const path = require('../config/path.js');

const scss = () => {
  const plugins = [
    combineDuplicatedSelectors({
      removeDuplicatedProperties: true,
    }),
    mergeRules(),
  ];

  return src(path.scss.src)
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: 'SCSS',
          message: '<%= error.message %>',
        }),
      }),
    )
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))

    .pipe(size({ title: 'scss → css' }))
    .pipe(dest(path.scss.dest));
};

module.exports = scss;
