const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');

// Static server


// Static Server + watching scss/html files

gulp.task('serve:wurst.world', ['sass:wurst.world'], function () {

  browserSync.init({
    server: "./sites/wurst.world",
      middleware:[
          require('connect-history-api-fallback')()
      ]
    //proxy:'localhost',
    //port: 3000
  });

  gulp.watch("sites/wurst.world/**/*.scss", ['sass:wurst.world']);
  gulp.watch("sites/wurst.world/**/*.html").on('change', browserSync.reload);
  gulp.watch("sites/wurst.world/**/*.js").on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass:wurst.world', function () {
  return gulp.src("sites/wurst.world/style/*.scss")
    .pipe(sass())
    .pipe(gulp.dest("sites/wurst.world"))
    .pipe(browserSync.stream());
});

gulp.task('wurst.world', ['serve:wurst.world']);

gulp.task('default', ['wurst.world']);