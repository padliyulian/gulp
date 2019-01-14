var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');


gulp.task('sass', function () {
  return gulp.src('src/sass/**/*.+(scss|sass)')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('babel', function () {
  gulp.src('src/js/es6/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('script.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('src/js/'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: 'src',
      routes: {
        "/bower_components": "bower_components"
      }
    },
  })
})

gulp.task('useref', function () {
  return gulp.src('src/*.html')
    .pipe(useref())
    // Minifies only if it's a JavaScript file
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

gulp.task('images', function () {
  return gulp.src('src/img/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(cache(imagemin({
      // Setting interlaced to true
      interlaced: true
    })))
    .pipe(gulp.dest('dist/img'))
});

gulp.task('fonts', function () {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
})

gulp.task('clean:dist', function () {
  return del.sync('dist');
})

gulp.task('watch', ['browserSync', 'sass', 'babel'], function () {
  gulp.watch('src/sass/**/*.sass', ['sass']);
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/js/**/*.js', browserSync.reload);
  gulp.watch('src/js/**/*.js', ['babel']);
});

gulp.task('build', function (callback) {
  runSequence('clean:dist',
    ['sass', 'useref', 'images', 'fonts'],
    callback
  )
})

gulp.task('default', function (callback) {
  runSequence(['sass', 'babel', 'browserSync', 'watch'],
    callback
  )
})