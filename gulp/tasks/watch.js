const gulp = require('gulp');
const watch = require('gulp-watch');
// const browserSync = require('browser-sync').create();

gulp.task('watch', function() {

  // set up gulp tasks that do not use browserSync
  watch('./dev/assets/styles/**/*.css', function() {
    gulp.start('styles');
  });

  watch('.dev/assets/js/**/*.js', function() {
    gulp.start('scripts');
  });

//   browserSync.init({
//     notify: false,
//     server: {
//       baseDir: "dev"
//     }
//   });
//
//   watch('./views/**/*.hbs', function() {
//     browserSync.reload();
//   });
//
//   watch('./dev/assets/styles/**/*.css', function() {
//     gulp.start('cssInject');
//   });
//
//   watch('.dev/assets/js/**/*.js', function() {
//     gulp.start('scriptsRefresh');
//   });
});
//
// gulp.task('cssInject', ['styles'], function() {
//   return gulp.src('./dev/bundle/css/styles.css')
//     .pipe(browserSync.stream());
// });
//
// gulp.task('scriptsRefresh', ['scripts'], function() {
//   browserSync.reload();
// });
