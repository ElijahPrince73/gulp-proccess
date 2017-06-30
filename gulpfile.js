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


// Handlebars plugins
var handlebars = require('gulp-handlebars');
var handlebarsLib = require('handlebars');
var declare = require('gulp-declare');
var wrap = require('gulp-wrap');

//Image Compession
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');

// File paths
var DIST_PATH = 'dist';
var processFiles =	'public/*.html'
var SCRIPTS_PATH = 'public/js/main-es6.js';
var VENDORS_PATH = 'public/js/vendor.js'
var CSS_PATH = 'public/css/**/*.css';
var SCSS_PATH = 'public/scss/**/*.scss'
var TEMPLATES_PATH = 'templates/**/*.hbs';
var IMAGES_PATH = 'public/images/**/*.{png,jpeg,jpg,svg,gif}';


// Styles For SCSS
gulp.task('styles', function () {
	console.log('starting styles task');
	return gulp.src(SCSS_PATH)
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
		.pipe(gulp.dest('public/css/'))
		.pipe(sourcemaps.write())
		.pipe(rename({suffix: ".min"}))
		.pipe(gulp.dest(DIST_PATH + '/css/'))
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
		.pipe(concat('main.js'))
		.pipe(gulp.dest('public/js/'))
		.pipe(sourcemaps.write())
		.pipe(rename({suffix: ".min"}))
		.pipe(gulp.dest(DIST_PATH + '/js/'))
		.pipe(livereload());
});

var vendors = [
	'public/js/vendors/jquery.min.js',
	'public/js/vendors/bootstrap.min.js'
]

gulp.task('vendorJSCompile', function() {
  return gulp.src(vendors)
    .pipe(concat('.'))
    .pipe(rename('vendor.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('vendorJSUglify', function() {
  return gulp.src(VENDORS_PATH)
    .pipe(concat('.'))
    .pipe(rename('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
		.pipe(livereload());
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

// copy fonts
gulp.task('copyFonts', function() {
  return gulp.src('public/fonts/*')
    .pipe(gulp.dest('dist/fonts/'))
		.pipe(livereload());
});

// Processes html changing style and script tags of the production code to .min versions
gulp.task('processHTML', function () {
  return gulp.src(processFiles)
    .pipe(processhtml({process: true}))
    .pipe(gulp.dest('dist'))
		.pipe(livereload());
});


gulp.task('templates', function () {
	return gulp.src(TEMPLATES_PATH)
		.pipe(handlebars({
			handlebars: handlebarsLib
		}))
		.pipe(wrap('Handlebars.template(<%= contents %>)'))
		.pipe(declare({
			namespace: 'templates',
			noRedeclare: true
		}))
		.pipe(concat('templates.js'))
		.pipe(gulp.dest(DIST_PATH))
		.pipe(livereload());
});

gulp.task('clean', function () {
	return del.sync([
		DIST_PATH
	])
})

gulp.task('default', ['vendorJSCompile','vendorJSUglify','clean','copyFonts','templates','styles','scripts'], function () {
	console.log('Starting default task');
	require('./server.js');
	gulp.watch(SCRIPTS_PATH, ['scripts']);
	gulp.watch(SCSS_PATH, ['styles']);
	gulp.watch(TEMPLATES_PATH, ['templates']);
});

gulp.task('watch', ['processHTML','images','default'], function () {
	console.log('Starting watch task');
	require('./server.js');
	livereload.listen();
	gulp.watch(SCRIPTS_PATH, ['scripts']);
	gulp.watch(SCSS_PATH, ['styles']);
	gulp.watch(TEMPLATES_PATH, ['templates']);
});
