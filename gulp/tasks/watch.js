const gulp = require('gulp');
const watch = require('gulp-watch');
const browserSync = require('browser-sync').create();

gulp.task('watch', function() {

  browserSync.init({
    notify: true,
    proxy: "localhost:3000"
  });

  watch('./views/**/*.hbs', function() {
    browserSync.reload();
  });

  watch('./dev/assets/css/**/*.css', function() {
    gulp.start('cssInject');
  });

  watch('./dev/assets/js/**/*.js', function() {
    gulp.start('scriptsRefresh');
  });
});

gulp.task('cssInject', ['styles'], function() {
  return gulp.src('./public/css/styles.css')
    .pipe(browserSync.stream());
});

gulp.task('scriptsRefresh', ['scripts'], function() {
  browserSync.reload();
});
