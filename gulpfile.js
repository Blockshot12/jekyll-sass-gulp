/**
 * Gulpfile.
 *
 * Implements:
 * 			1. Sass to CSS conversion + uglify
 * 			2. JS concatenation + uglify
 *      3. Vendor JS concatenation + uglify
 *      4. Images minify
 *      5. Fonts minify
 *      6. TWIG files
 *      7. Drush Cache Rebuild
 *      8. Browser-Sync
 * 			9. Watch files
 *
 * @since 1.0.0
 * @author Blockshot
 */

/**
 * Configuration: Project variables
 *
 * The projectUrl contains the local URL, example.dd:8083.
 */
const project = 'My_site';
const projectUrl = 'http://localhost:4000/';

const siteRoot = '_site';

const sassSrc = 'css/**/*.scss';
const sassDest = siteRoot + '/css/';

const jsSrc = 'js/**/*.js';
const jsDest = siteRoot + '/js/';
const jsFile = 'scripts';

const jsVendorSrc = 'js/vendors/*.js';

const htmlSrc = siteRoot + '/**/*.html'; // Only Jekyll output to _site is minified.
const htmlDest = siteRoot;

const imgSrc = 'img/**/*';
const imgDest = siteRoot + '/img/';

const fontSrc = siteRoot + '/font/**/*';
const fontDest = siteRoot + '/font/';


/**
 * Configuration: Load plugins
 */
const autoprefixer = require('gulp-autoprefixer');
const cache = require('gulp-cache');
const child = require('child_process');
const concat = require('gulp-concat');
const fontmin = require('gulp-fontmin');
const flatten = require('gulp-flatten');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const minifycss = require('gulp-uglifycss');
const notify = require('gulp-notify');
const path = require('path');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const shell = require('gulp-shell');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const util = require('gulp-util');

const browserSync = require('browser-sync');
const reload = browserSync.reload;

/**
 * Task: Compile, minify and rename all Sass files to style.min.css.
 */
gulp.task('sass', () => {
  let onError = function(error) {
    notify.onError({
      title: '<%= error.message %>',
      sound: 'Frog',
      icon: path.join(__dirname, 'help/error.png'),
      contentImage: path.join(__dirname, 'help/sass.png'),
      time: 3000,
      onLast: true
    })(error);

    this.emit('end');
  };
  return gulp.src(sassSrc)
    .pipe(watch(sassSrc))
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      style: 'compressed',
      precision: 10
    }))
    .pipe(sourcemaps.write({
      includeContent: false
    }))
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(autoprefixer(
      'last 2 version',
      '> 1%',
      'safari 5',
      'ie 8',
      'ie 9',
      'opera 12.1',
      'ios 6',
      'android 4'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(sassDest))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(minifycss())
    .pipe(gulp.dest(sassDest))
    .pipe(reload({
      stream: true,
      once: true
    }))
    .pipe(notify({
      title: 'Sass task completed',
      message: 'All Sass files are compiled into CSS and minified.',
      sound: 'Submarine',
      icon: path.join(__dirname, 'help/check.png'),
      contentImage: path.join(__dirname, 'help/sass.png'),
      time: 1000,
      onLast: true
    }));
});

/**
 * Task: JS
 */
gulp.task('js', function() {
  let onError = function(error) {
    notify.onError({
      title: '<%= error.message %>',
      sound: 'Frog',
      icon: path.join(__dirname, 'help/error.png'),
      contentImage: path.join(__dirname, 'help/js.png'),
      time: 3000,
      onLast: true
    })(error);

    this.emit('end');
  };
  return gulp.src([jsVendorSrc, jsSrc])
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(concat(jsFile + '.js'))
    .pipe(gulp.dest(jsDest))
    .pipe(rename({
      basename: jsFile,
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest(jsDest))
    .pipe(reload({
      stream: true,
      once: true
    }))
    .pipe(notify({
      title: 'JS task completed',
      message: 'All JS files are saved and minified.',
      sound: 'Submarine',
      icon: path.join(__dirname, 'help/check.png'),
      contentImage: path.join(__dirname, 'help/js.png'),
      time: 1000,
      onLast: true
    }));
});

/**
 * Task: Minify all HTML files.
 */
gulp.task('html', () => {
  let onError = function(error) {
    notify.onError({
      title: '<%= error.message %>',
      sound: 'Frog',
      icon: path.join(__dirname, 'help/error.png'),
      contentImage: path.join(__dirname, 'help/html.png'),
      time: 3000,
      onLast: true
    })(error);

    this.emit('end');
  };
  return gulp.src(htmlSrc)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
    .pipe(gulp.dest(htmlDest))
    .pipe(notify({
      title: 'HTML task completed',
      message: 'All HTML files are minified.',
      sound: 'Submarine',
      icon: path.join(__dirname, 'help/check.png'),
      contentImage: path.join(__dirname, 'help/html.png'),
      time: 1000,
      onLast: true
    }));
});

/**
 * Task: Compress all images im the folder img.
 */
gulp.task('img', function() {
  return gulp.src(imgSrc)
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(imgDest))
    .pipe(reload({
      stream: true,
      once: true
    }))
    .pipe(notify({
      title: 'Images task completed',
      message: 'All images are saved and minified.',
      sound: 'Submarine',
      icon: path.join(__dirname, 'help/check.png'),
      contentImage: path.join(__dirname, 'help/img.png'),
      time: 1000,
      onLast: true
    }));
});

/**
 * Task: Build Jekyll site.
 */
gulp.task('jekyll', () => {
  const jekyll = child.spawn('jekyll', [
    'build',
    //'--incremental',
    '--drafts'
  ]);

  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => util.log('Jekyll: ' + message));
  };

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});

/**
 * Task: Run Browser-Sync on siteRoot.
 */
gulp.task('serve', () => {
  browserSync.init({
    files: [siteRoot + '/**'],
    port: 4000,
    server: {
      baseDir: siteRoot
    }
  });
});

gulp.task('watch', function() {
  gulp.watch(sassSrc, ['sass']);
  gulp.watch(imgSrc, ['img']);
});
