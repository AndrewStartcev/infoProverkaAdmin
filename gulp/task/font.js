const { src, dest } = require('gulp');
// Плагины
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const newer = require('gulp-newer');

// Конфигурация
const path = require('../config/path.js');
const app = require('../config/app.js');

// Обработка шрифтов
const font = () => {
  return src(path.font.src)
    .pipe(plumber({
      errorHandler: notify.onError(error => ({
        title: "Ошибка в Шрифтах",
        message: error.message
      }))
    }))
    .pipe(newer(path.font.dest))
    .pipe(dest(path.font.dest)); // Просто перенос шрифтов в папку назначения
};

module.exports = font;
