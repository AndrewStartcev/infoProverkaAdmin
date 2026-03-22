const pathSrc = "./src";
const pathDest = "./public"

module.exports = {
  root: pathDest,

  html: {
    src: pathSrc + "/html/*.html",
    watch: pathSrc + "/html/**/*.html",
    dest: pathDest
  },
  css: {
    src: pathSrc + "/assets/css/*.css",
    watch: pathSrc + "/assets/css/**/*.css",
    dest: pathDest + "/assets/css"
  },
  scss: {
    src: pathSrc + "/scss/*.{sass,scss}",
    watch: pathSrc + "/scss/**/*.{sass,scss}",
    dest: pathDest + "/assets/css"
  },
  js: {
    src: pathSrc + "/assets/js/*.js",
    watch: pathSrc + "/assets/js/**/*.js",
    dest: pathDest + "/assets/js"
  },
  lib: {
    src: pathSrc + "/assets/lib/**/*.*",
    watch: pathSrc + "/assets/ib/**/*.*",
    dest: pathDest + "/assets/lib"
  },
  img: {
    src: pathSrc + "/assets/img/**/*.{png,jpg,jpeg,svg,ico}",
    watch: pathSrc + "/assets/img/**/*.{png,jpg,jpeg,svg,ico}",
    dest: pathDest + "/assets/img"
  },
  svg: {
    src: pathSrc + "/assets/img/svg/*.svg",
    watch: pathSrc + "/assets/img/svg/*.svg",
    dest: pathDest + "/assets/img/svg"
  },
  font: {
    src: pathSrc + "/assets/font/*.{eot,ttf,otf,otc,ttc,woff,woff2,svg}",
    watch: pathSrc + "/assets/font/**/*.{eot,ttf,otf,otc,ttc,woff,woff2,svg}",
    dest: pathDest + "/assets/font"
  },

}
