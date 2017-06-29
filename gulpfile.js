var gulp = require('gulp');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var minifyCss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var babel = require('gulp-babel');
var del =  require('del');
var rename = require('gulp-rename');
var processhtml = require('gulp-processhtml')

//Handlebars Plugin
var handlebars =  require('gulp-handlebars');
var handlebarsLib = require('handlebars');
var declare = require('gulp-declare');
var wrap =  require('gulp-wrap');

//Image Compession
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');

// File paths
var DIST_PATH = 'dist';
var SCRIPTS_PATH = 'public/js/**/*.js';
var CSS_PATH = 'public/css/**/*.css';
var TEMPLATES_PATH = 'templates/**/*.hbs';
var IMAGES_PATH = 'public/images/**/*.{png,jpeg,jpg,svg,gif}';


// Styles For SCSS
gulp.task('styles', function () {
	console.log('starting styles task');
	return gulp.src('public/scss/styles.scss')
		.pipe(plumber(function (err) {
			console.log('Styles Task Error');
			console.log(err);
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(autoprefixer())
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(sourcemaps.write())
		.pipe(rename({suffix: ".min"}))
		.pipe(gulp.dest(DIST_PATH + '/css/'))
		.pipe(livereload());
});

// concatenate & minify vendor JS
var vendorScripts = [
  'public/js/vendor/jquery.js',
  'public/js/vendor/bootstrap.js'
];
gulp.task('vendors', function() {
  return gulp.src(vendorScripts)
    .pipe(concat('.'))
    .pipe(rename('vendor.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('vendorJSUglify', function() {
  return gulp.src('public/js/vendor.js')
    .pipe(concat('.'))
    .pipe(rename('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/'))
		.pipe(livereload());
});

// Scripts
gulp.task('scripts', function () {
	console.log('starting scripts task');

	return gulp.src(SCRIPTS_PATH)
		.pipe(plumber(function (err) {
			console.log('Scripts Task Error');
			console.log(err);
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(uglify())
		.pipe(concat('scripts.js'))
		.pipe(sourcemaps.write())
		.pipe(rename({suffix: ".min"}))
		.pipe(gulp.dest(DIST_PATH + '/js/'))
		.pipe(livereload());
});

//Copy Fonts
gulp.task('copyFonts', function() {
  return gulp.src('public/fonts/*')
    .pipe(gulp.dest(DIST_PATH + '/fonts/'))
});

// Processes html changing style and script tags of the production code to .min versions
var processFiles = [
  'public/*.html'
];
gulp.task('processHTML', function () {
  return gulp.src(processFiles)
    .pipe(processhtml({process: true}))
    .pipe(gulp.dest('dist'))
		.pipe(livereload())
});

gulp.task('copyHTML', function() {
  return gulp.src('public/*.html')
    .pipe(gulp.dest(DIST_PATH))
		.pipe(livereload())
});

// Images
gulp.task('images', function () {
	console.log('starting images task');
	return gulp.src(IMAGES_PATH)
	.pipe(imagemin(
		[
			imagemin.gifsicle(),
			imagemin.jpegtran(),
			imagemin.optipng(),
			imagemin.svgo(),
			imageminPngquant(),
			imageminJpegRecompress()
		]
	))
	.pipe(gulp.dest(DIST_PATH + '/images/'))
});

gulp.task('templates', function () {
	return gulp.src(TEMPLATES_PATH)
	.pipe(plumber(function (err) {
		console.log('Handlebars Task Error');
		console.log(err);
		this.emit('end');
	}))
		.pipe(handlebars({
			handlebars:handlebarsLib
		}))
		.pipe(wrap('Handlebars.template(<%= contents %>)'))
		.pipe(declare({
			namespace: 'templates',
			noRedeclare:  true
		}))
		.pipe(concat('templates.js'))
		.pipe(gulp.dest(DIST_PATH))
		.pipe(livereload())
})

gulp.task('clean', function () {
	return del.sync([
		DIST_PATH
	])
})

gulp.task('default', ['clean','templates', 'styles', 'scripts','vendorJSUglify','vendors', 'copyFonts','processHTML','copyHTML'],function () {
	console.log('Starting default task');
	require('./server.js');
	livereload.listen();
});

gulp.task('full', ['images','default'], function () {
	console.log('Starting watch task');
	require('./server.js');
	livereload.listen();
});
