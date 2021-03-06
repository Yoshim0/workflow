/*
** V1.0.0 - 07/08/2018
** Gulp WorkFlow created by Yoshi Mortelmans
** Using: Gulp, Sass, BrowserSync, AutoPrefixer, Clean, Concat, Browserify and Merge stream
*/

var gulp = require('gulp'); // Initiate Gulp
var sass = require('gulp-sass'); // Gulp Sass Compiler
var browserSync = require('browser-sync'); // Sync with Browser
var reload = browserSync.reload; // Reload Browser after changes
var autoprefixer = require('gulp-autoprefixer'); // Auto Prefix
var clean = require('gulp-clean'); // Clean Files
var concat = require('gulp-concat'); // Concatenate files
var browserify = require('gulp-browserify'); // Lets you require modules in the browser by bundling up all of you dependencies
var merge = require('merge-stream'); // Concatenate CSS files
var newer = require('gulp-newer'); // Check for newer content / images
var imagemin = require('gulp-imagemin'); // Image minification
var injectPartials = require('gulp-inject-partials'); // inject code into html
var minify = require('gulp-minify'); // minifies JS files
var cssMin = require('gulp-min'); // Minifies CSS
var rename = require('gulp-rename'); // Rename files
var htmlMin = require('gulp-htmlmin'); // Minifiy HTML

// SOURCEFILES
var sourcePaths ={
	sassSource : 'src/scss/*.scss',
	htmlSource : 'src/*.html',
  htmlPartialSource : 'src/partials/*.html',
	jsSource : 'src/js/**',
  fontsSource : 'src/fonts',
  imgSource : 'src/img/**'
}

// APP FILES
var appPaths ={
	root : 'app/',
	css : 'app/css',
	js : 'app/js',
  fonts : 'app/fonts',
  img : 'app/img'
}

// INJECT PARTIALS
/*
** Set the path files to inject
** Inject partials
** Set destination for compiled html files
*/
gulp.task('html', function(){
  return gulp.src(sourcePaths.htmlSource)
    .pipe(injectPartials())
    .pipe(gulp.dest(appPaths.root))
});

// CLEAR UNUSED HTML FILES
/*
** Set path to check for unused files in app folder
** read false to not
*/
gulp.task('cleanHtml', function(){
	return gulp.src(appPaths.root + '/*.html', {read: true, force: true })
		.pipe(clean());
});

// CLEAR UNUSED JS FILES
/*
** Set path to check for unused files in app folder
** read false to not
*/
gulp.task('cleanJs', function(){
	return gulp.src(appPaths.js + '/*.js', {read: false, force: true })
		.pipe(clean());
});

// SASS COMPILER
/*
** Define Vars for Bootstrap and SassFiles
** SassFiles equals to the sourcepath to compile the files
** Autoprefix before compile
** Output compressed, nested, expanded
** Return / merge all files --> concatenate and create compiled file in set location
*/
gulp.task('sass', function(){
  var bootstrapCss = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
  var sassFiles;

	sassFiles = gulp.src(sourcePaths.sassSource)
		.pipe(autoprefixer())
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
		
    return merge(bootstrapCss, sassFiles)
      .pipe(concat('app.css'))
      .pipe(gulp.dest(appPaths.css));
});

// MOVE FONTS
/*
** Set the path to copy the files
** Set destination for copied fonts
*/
gulp.task('moveFonts', function(){
  gulp.src(sourcePaths.fontsSource + '/*.{eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest(appPaths.fonts));
});

// JS COMPILER
/*
** Set the path to compile the files
** Concatenate JS files into one file
** Set destination for compiled js files
*/
gulp.task('scripts', ['cleanJs'], function(){
	gulp.src(sourcePaths.jsSource)
		.pipe(concat('main-min.js'))
    .pipe(browserify())
		.pipe(gulp.dest(appPaths.js));
});

// IMAGES
/*
** Set source path for images
** Look for newer images
** Initiate imageminifycation
** copy images to app folder
*/
gulp.task('images', function(){ 
  return gulp.src(sourcePaths.imgSource)
    .pipe(newer(appPaths.img))
    .pipe(imagemin())
    .pipe(gulp.dest(appPaths.img));
});

/* PRODUCTION TASKS */

// HTML MINIFIER
/*
** Inject partials
*/
gulp.task('htmlMin', function(){
  return gulp.src(sourcePaths.htmlSource)
    .pipe(injectPartials())
    .pipe(htmlMin({collapseWhitespace: true}))
    .pipe(gulp.dest(appPaths.root))
});

// CSS MINIFIER
/*
** Minify CSS after Concat and rename with suffix ".min"
*/
gulp.task('compressCss', function(){
  var bootstrapCss = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
  var sassFiles;

  sassFiles = gulp.src(sourcePaths.sassSource)
    .pipe(autoprefixer())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    
    return merge(bootstrapCss, sassFiles)
      .pipe(concat('app.css'))
      .pipe(cssMin())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(appPaths.css));
});

// JS MINIFIER
/*
** Set the path to compile the files
** Concatenate JS files into one file
** Set destination for compiled js files
*/
gulp.task('compress', function(){
  gulp.src(sourcePaths.jsSource)
    .pipe(concat('main-min.js'))
    .pipe(browserify())
    .pipe(minify())
    .pipe(gulp.dest(appPaths.js));
});

/* END OF PRODUCTION TASKS */

/**********************************************/
// HTML COPY / IS NOT NEEDED WEH USING PARTIALS
/*
** Set the path to copy files from
** Clear unused files
** Set destination to copy files to.
*/

// gulp.task('copy', ['cleanHtml'], function(){
// 	gulp.src(sourcePaths.htmlSource)
// 		.pipe(gulp.dest(appPaths.root))
// });
/**********************************************/


// BROWSERSYNC
/*
** Initialize the folders for sync in Browser
*/
gulp.task('serve', ['sass'], function(){
	browserSync.init([appPaths.css + '/*.css', appPaths.root + '/*.html', appPaths.js + '/*.js'],{
		server: {
			baseDir : appPaths.root
		}
	})
});

// GULP TASKS
/*
** Watch changed files and execute tasks
** Copy HTML files
*/
gulp.task('watch', ['serve', 'sass', 'cleanHtml','cleanJs', 'scripts', 'moveFonts', 'images', 'html'], function(){
	gulp.watch([sourcePaths.sassSource], ['sass']);
	gulp.watch([sourcePaths.jsSource], ['scripts']);
  gulp.watch([sourcePaths.imgSource], ['images']);
  gulp.watch([sourcePaths.htmlSource, sourcePaths.htmlPartialSource], ['html']);
});

// GULP DEFAULT TASK
/*
** Execute previous task all at once
*/
gulp.task('default', ['watch']);

gulp.task('production', ['htmlMin', 'compressCss', 'compress'])