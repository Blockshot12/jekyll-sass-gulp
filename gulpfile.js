/**
 * Gulpfile.
 *
 * Implements:
 * 			1. Sass + Postcss
 * 			2. JS concatenation + uglify
 *      3. Vendor JS concatenation + uglify
 *      4. Images minification
 *      5. Fonts minification
 *      6. Jekyll build & watch
 *      7. Build with Gulp & Jekyll
 *      8. Browser-Sync & watch files
 *      9. Default Gulp task
 *
 * @since 1.0.0
 * @author Blockshot
 */

/**
 * Configuration: Project variables
 *
 * The projectUrl contains the local URL, example:4000.
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

const fontSrc = siteRoot + '/fonts/**/*';
const fontDest = siteRoot + '/fonts/';

const jekyllSrc = ['**/*.html','**/*.yml','**/*.json','!_site/**'];


/**
 * Configuration: Load plugins
 */
//const autoprefixer = require('gulp-autoprefixer');
const autoprefixer = require('autoprefixer');
const cache = require('gulp-cache');
const child = require('child_process');
const concat = require('gulp-concat');
const cssnano = require('cssnano');
const del = require('del');
const fontmin = require('gulp-fontmin');
const flatten = require('gulp-flatten');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const lost = require('lost');
const notify = require('gulp-notify');
const path = require('path');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const rucksack = require('rucksack-css');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const util = require('gulp-util');

const browserSync = require('browser-sync');
const reload = browserSync.reload;


/**
 * Task: Compile, minify & rename all Sass files to style.min.css.
 */
gulp.task('sass', () => {
  var onError = function(error) {
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
  return gulp.src(sassSrc, { sourcemaps: true })
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sass())
    .pipe(postcss([
      lost,
      rucksack,
      autoprefixer({browsers:['last 5 versions']})
    ]))
    .pipe(gulp.dest(sassDest))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(postcss([
      cssnano
    ]))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(sassDest))
    .pipe(reload({
      stream: true,
      once: true
    }))
    .pipe(notify({
      title: 'Sass task completed',
      message: 'All Sass files are compiled into CSS & minified.',
      sound: 'Submarine',
      icon: path.join(__dirname, 'help/check.png'),
      contentImage: path.join(__dirname, 'help/sass.png'),
      time: 1000,
      onLast: true
    }));
});

/**
 * Task: Concat, rename &  minify all JS files to scripts.min.js.
 */
gulp.task('js', function() {
  var onError = function(error) {
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

    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(concat(jsFile + '.js'))
    .pipe(gulp.dest(jsDest))
    .pipe(rename({
      basename: jsFile,
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(jsDest))
    .pipe(reload({
      stream: true,
      once: true
    }))
    .pipe(notify({
      title: 'JS task completed',
      message: 'All JS files are saved & minified.',
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
  var onError = function(error) {
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
      message: 'All images are saved & minified.',
      sound: 'Submarine',
      icon: path.join(__dirname, 'help/check.png'),
      contentImage: path.join(__dirname, 'help/img.png'),
      time: 1000,
      onLast: true
    }));
});

/**
 * Task: Minify all font files.
 */
gulp.task('fontmin', function() {
  return gulp.src(fontSrc)
    .pipe(fontmin())
    .pipe(gulp.dest(fontDest))
    .pipe(reload({
      stream: true,
      once: true
    }))
    .pipe(notify({
      title: 'Fonts task completed',
      message: 'All fonts are saved and minified.',
      sound: 'Submarine',
      icon: path.join(__dirname, 'help/check.png'),
      contentImage: path.join(__dirname, 'help/font.png'),
      time: 1000,
      onLast: true
    }))
});

/**
 * Task: Build Jekyll site.
 */
gulp.task('jekyll', () => {
  const jekyll = child.spawn('jekyll', [
    'build',
    '--watch',
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
 * Task: Build al files with Gulp & Jekyll.
 */
gulp.task('build', ['sass','js','img','jekyll']);


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

  gulp.watch(sassSrc, ['sass']);
  gulp.watch(jsSrc, ['js']);
  gulp.watch(htmlSrc, ['html']);
  gulp.watch(imgSrc, ['img']);
  gulp.watch(fontSrc, ['font']);
});

/**
 * Task: Delete all build files inside siteRoot.
 */
gulp.task('clean', function() {
  return del([siteRoot + '/**/*']);
});


/**
 * Task: Run this Gulpfile.
 */
gulp.task('default', [build','jekyll','serve']);
