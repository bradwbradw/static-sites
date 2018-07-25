const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
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
      }
      //proxy:'localhost',
      //port: 3000
    });

    gulp.watch(`sites/${site}/**/.scss`, [`sass:${site}`]);
    gulp.watch(`sites/${site}/**/*.html`).on('change', browserSync.reload);
    gulp.watch(`sites/${site}/**/*.js`).on('change', browserSync.reload);
  });

// Compile sass into CSS & auto-inject into browsers
  gulp.task(`sass:${site}`, function () {
    return gulp.src(`sites/${site}/style/*.scss`)
      .pipe(sass())
      .pipe(gulp.dest(`sites/${site}`))
      .pipe(browserSync.stream());
  });

}

_.each(require('./domains'), serve);

gulp.task('default', ['serve:studioclementine.com']);