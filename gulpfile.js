'use strict';

var argv = require('yargs').argv;
var gulp = require('gulp');
var gulpif = require('gulp-if');
const sass = require('gulp-sass')(require('sass'));
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var maps   = require('gulp-sourcemaps');
const sync = require('gulp4-run-sequence');
var dist = decideDist();

gulp.task('default', async function(done) {
    sync('watch', 'copy-src', 'sass', 'lint', 'uglify', 'webserver', done);
  });

  gulp.task('build', async function(done) {
    sync('copy-src', 'sass', 'uglify', done);
  });

gulp.task('webserver', async () => {
    connect.server({
        livereload: true,
        root: ['./web/']
    });
});

gulp.task('sass', async () => {
    return gulp.src('./src/sarine.plugin.imgplayer.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dist));
});

gulp.task('copy-src', async () => {
    return gulp.src('./src/sarine.plugin.imgplayer.js')
        .pipe(gulp.dest(dist));
});

gulp.task('uglify', async () => {
    return gulp.src('./src/sarine.plugin.imgplayer.js')
        .pipe(maps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(maps.write('./'))
        .pipe(gulp.dest(dist));
});

gulp.task('lint', async () => {
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

gulp.task('watch', async () => {
    if(!argv.production) { 
        gulp.watch('./src/sarine.plugin.imgplayer.scss', ['sass']);
        gulp.watch('./src/sarine.plugin.imgplayer.js', ['lint','uglify']);
    }
});

function decideDist() {
    if(process.env.buildFor == 'deploy')
    {
        console.log("dist is github folder");
        return './dist/';
    }
    else
    {
        console.log("dist is local");
        return '../../../dist/content/viewers/atomic/v1/assets/';
    }
}