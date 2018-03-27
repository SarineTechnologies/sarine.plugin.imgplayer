'use strict';

var argv = require('yargs').argv;
var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var sass = require('gulp-sass');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var maps   = require('gulp-sourcemaps');

gulp.task('default', ['watch', 'copy-src', 'sass', 'lint', 'uglify', 'webserver']);

gulp.task('webserver', function() {
    connect.server({
        livereload: true,
        root: ['./web/']
    });
});

gulp.task('sass', function() {
    return gulp.src('./src/sarine.plugin.imgplayer.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./web/dist'));
});

gulp.task('copy-src', function() {
    return gulp.src('./src/sarine.plugin.imgplayer.js')
        .pipe(gulp.dest('./web/dist'));
});

gulp.task('uglify', function() {
    return gulp.src('./src/sarine.plugin.imgplayer.js')
        .pipe(maps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('./web/dist'));
});

gulp.task('lint', function() {
    return gulp.src('./src/sarine.plugin.imgplayer.js')
        .pipe(eslint({
            'rules': {
                'quotes': [1, 'single'],
                'semi': [1, 'always']
            }
        }))
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('watch', function() {
    if(!argv.production) { 
        gulp.watch('./src/sarine.plugin.imgplayer.scss', ['sass']);
        gulp.watch('./src/sarine.plugin.imgplayer.js', ['lint','uglify']);
    }
});
