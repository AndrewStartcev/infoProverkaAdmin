const { watch, series, parallel } = require('gulp');
const browserSync = require('browser-sync').create();

// Конфигурация
const path = require('./gulp/config/path.js');
// app.js можно оставить как есть (isDev/isProd), но сборка от них больше не зависит
// const app = require('./gulp/config/app.js');

// Задачи
const clear = require('./gulp/task/clear.js');
const html = require('./gulp/task/html.js');
const scss = require('./gulp/task/scss.js'); // лёгкая компиляция без минификации
const css = require('./gulp/task/css.js'); // простое копирование src/css/*
const js = require('./gulp/task/js.js'); // простое копирование src/js/*
const img = require('./gulp/task/img.js'); // простое копирование изображений
const font = require('./gulp/task/font.js'); // простое копирование шрифтов
const lib = require('./gulp/task/lib.js'); // простое копирование библиотек

// Сервер (для PHP-проектов можно переключить на proxy)
// Пример: browserSync.init({ proxy: "http://wp.local", notify:false, open:false, ghostMode:false, ui:false });
const server = () => {
  browserSync.init({
    server: { baseDir: path.root },
    notify: false,
    open: false,
    ghostMode: false,
    ui: false,
    online: false,
  });
};

// Аккуратный reload (минимальный «дребезг»)
const reload = done => {
  browserSync.reload();
  done();
};

// Опции «тихих» вотчеров — меньше ложных срабатываний, ниже нагрузка
const watchOpts = {
  ignoreInitial: false,
  awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
};

// Наблюдение
const watcher = () => {
  watch(path.html.watch, watchOpts, series(html, reload));
  watch(path.scss.watch, watchOpts, series(scss, reload)); // если не используешь SCSS — можешь закомментировать
  watch(path.css.watch, watchOpts, series(css, reload));
  watch(path.js.watch, watchOpts, series(js, reload));
  watch(path.img.watch, watchOpts, series(img, reload));
  watch(path.font.watch, watchOpts, series(font, reload));
  watch(path.lib.src, watchOpts, series(lib, reload));
};

// Основная сборка
const build = series(clear, parallel(html, scss, css, js, img, font, lib));

// Режим разработки
const dev = series(build, parallel(watcher, server));

// Экспорт задач
exports.clear = clear;
exports.html = html;
exports.scss = scss;
exports.css = css;
exports.js = js;
exports.img = img;
exports.font = font;
exports.lib = lib;
exports.watch = watcher;
exports.build = build;

// По умолчанию — dev
exports.default = dev;
