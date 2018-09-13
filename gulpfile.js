const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const notify = require("gulp-notify");
const plumber = require('gulp-plumber');
const _ = require('lodash');

// Static server


// Static Server + watching scss/html files

function serve(site) {

  gulp.task('serve:' + site, ['sass:' + site], function () {

    browserSync.init({
      server: "./sites/" + site,
      middleware: [
        require('connect-history-api-fallback')()
      ],
      ghostMode: {
        scroll: false,
        clicks: false,
        forms: false
      },
      //proxy:'localhost',
      port: process.env.PORT || 3000
    });

    gulp.watch(`sites/${site}/**/*.scss`, [`sass:${site}`]);
    gulp.watch(`sites/${site}/**/*.html`).on('change', bla => {
      console.log("html changed", bla);
      browserSync.reload()
    });
    gulp.watch(`sites/${site}/**/*.js`).on('change', bla => {
      console.log("js changed", bla);
      browserSync.reload()
    });
  });

// Compile sass into CSS & auto-inject into browsers
  gulp.task(`sass:${site}`, function () {

    return gulp.src(`sites/${site}/style/*.scss`)
      .pipe(plumber({
        errorHandler: (e) => {
          notify.onError("Error: <%= error.message %>")(e)
        }
      }))
      .pipe(sass())
      .pipe(gulp.dest(`sites/${site}`))
      .pipe(browserSync.stream());
  });

}

_.each(require('./domains'), serve);

//gulp.task('default', ['serve:studioclementine.com']);
gulp.task('default', ['serve:scramples.xyz.gs']);