const { src, dest, series, watch } = require("gulp");
const sass = require("gulp-sass");
const csso = require("gulp-csso");
const include = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const del = require("del");
// const imagemin = require("gulp-imagemin");
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const sync = require("browser-sync").create();

function html() {
  return src("src/**/**.html")
    .pipe(
      include({
        prefix: "@@",
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: false,
      })
    )
    .pipe(dest("dist"));
}

function scss() {
  return src("src/scss/**.scss")
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
      })
    )
    .pipe(csso())
    .pipe(concat("index.css"))
    .pipe(sourcemaps.write("."))
    .pipe(dest("dist"));
}

function img() {
  return src("src/img/**").pipe(dest("dist/img"));
}

function fonts() {
  return src("src/fonts/**").pipe(dest("dist/fonts"));
}

function php() {
  return src("src/php/**").pipe(dest("dist/php"));
}

function data() {
  return src("src/js/data.js").pipe(dest("dist"));
}

function script() {
  return src(["src/js/**.js", "!src/js/data.js"])
    .pipe(concat("index.js"))
    .pipe(dest("dist"));
}

function clear() {
  return del("dist");
}

function serve() {
  sync.init({
    server: "./dist",
  });

  watch("src/**/**.html", series(html)).on("change", sync.reload);
  watch("src/scss/**.scss", series(scss)).on("change", sync.reload);
  watch("src/js/data.js", series(data)).on("change", sync.reload);
  watch("src/js/**.js", series(script)).on("change", sync.reload);
  watch("src/img", series(img)).on("change", sync.reload);
  watch("src/fonts", series(fonts)).on("change", sync.reload);
}

exports.build = series(clear, scss, data, script, html, img, fonts, php);
exports.serve = series(clear, scss, data, script, html, img, fonts, php, serve);
exports.clear = clear;
