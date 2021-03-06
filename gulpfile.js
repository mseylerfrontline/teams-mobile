var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var stylus = require('gulp-stylus');
var nib = require('nib');

var paths = {
  stylus: ['./www/css/**/*.styl']
//  jade: ['./views/**/*.jade']
};


// gulp.task('jade', function (done) {
//   gulp.src(paths.jade)
//       .pipe(jade())
//       .pipe(gulp.dest('./www/templates/'))
//       .on('end', done);
// });

gulp.task('stylus', function (done) {
  gulp.src(paths.stylus)
    .pipe(stylus( { use: nib() } ))
    .pipe(gulp.dest('./www/css'))
    .on('end', done);
});


gulp.task('watch', function() {
  //gulp.watch(paths.jade, ['jade']);
  gulp.watch(paths.stylus, gulp.series('stylus'));
});

gulp.task('git-check', function() {
});

gulp.task('install', gulp.series(('git-check'), function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
}));


gulp.task('default', gulp.series('stylus'));

