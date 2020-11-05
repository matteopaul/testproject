// Import everything important
const gulp = require('gulp');
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const browserSync = require('browser-sync').create();
const browserify = require('gulp-browserify');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');

// For SASS -> CSS
const sass = require('gulp-sass');
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const sassLint = require('gulp-sass-lint');

// HTML
const htmlmin = require('gulp-htmlmin');

// JavaScript/TypeScript
const babel = require('gulp-babel');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

// Define Important Varaibles
const src = './src';
const dest = './dist';

// Minify HTML
const html = () => {
    return gulp.src(`${src}/*.html`)
                .pipe(plumber())
                .pipe(htmlmin({
                    removeComments: true,
                    html5: true,
                    removeEmptyAttributes: true,
                    collapseWhitespace: true,
                    removeTagWhitespace: true,
                    sortAttributes: true,
                    sortClassName: true
                }))
                .pipe(gulp.dest(`${dest}`));
}

const reload = (done) => {
    browserSync.reload();
    done();
}

const serve = (done) => {
    browserSync.init({
        server: {
            baseDir: dest
        }
    });
    done();
}

// Compile SASS
const css = () => {
    return gulp.src(`${src}/sass/**/*.sass`)
                .pipe(plumber())
                .pipe(sassLint({
                    options: {
                        formatter: 'stylish'
                    },
                    rules: {
                        'no-ids': 1,
                        'final-newline': 0,
                        'no-mergeable-selectors': 1,
                        'indentation': 0
                    }
                }))
                .pipe(sassLint.format())
                .pipe(sourcemaps.init())
                .pipe(sass.sync({outputStyle: 'compressed'})).on('error', sass.logError)
                .pipe(rename({basename: 'style', suffix: '.min'}))
                .pipe(postcss([autoprefixer(), cssnano()]))
                .pipe(sourcemaps.write(''))
                .pipe(gulp.dest(`${dest}/css`))
                .pipe(browserSync.stream());
}

const script = () => {
    return gulp.src(`${src}/js/**/*.js`)
                .pipe(plumber(((error) => {
                    gutil.log(error.message);
                })))
                .pipe(sourcemaps.init())
                .pipe(concat('concat.js'))
                .pipe(babel())
                .pipe(jshint())
                .pipe(jshint.reporter('jshint-stylish'))
                .pipe(browserify({
                    insertGlobals: true
                }))
                .pipe(uglify())
                .pipe(rename({basename: 'global', suffix: '.min'}))
                .pipe(sourcemaps.write(''))
                .pipe(gulp.dest(`${dest}/js`))
                .pipe(browserSync.stream());
}

const watch = () => gulp.watch([`${src}/sass/**/*.sass`, `${src}/*.html`, `${src}/js/**/*.js`], gulp.series(script, html, css, reload));

const dev = gulp.series(script, html, css, serve, watch);

const build = gulp.series(script, html, css);

exports.dev = dev;
exports.build = build;
exports.default = build;