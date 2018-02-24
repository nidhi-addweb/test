var fs = require('fs')
var del = require('del')
var runSequence = require('run-sequence')
var autoprefixer = require('autoprefixer')
var gulp = require('gulp')
var sass = require('gulp-sass')
var scsslint = require('gulp-scss-lint')
var rename = require('gulp-rename')
var postcss = require('gulp-postcss')
var imagemin = require('gulp-imagemin')
var bump = require('gulp-bump')
var concat = require('gulp-concat')
var replace = require('gulp-replace')
var uglify = require('gulp-uglify')
var plumber = require("gulp-plumber")
var sourcemaps = require('gulp-sourcemaps')
var gap = require('gulp-append-prepend')

var paths = {
    dist: './dist/',
    src: './app/',
    js: 'js/',
    css: 'css/',
    templates: 'templates/'
}

var staticFiles = [
    paths.src + 'images/**/*',
    paths.src + 'fonts/**/*',
]


gulp.task('clean', function(cb) {
	return del([paths.dist + '**/*'], cb);
})

gulp.task('scss-lint', function() {
  return gulp.src(paths.src + paths.css + '*.scss')
    .pipe(scsslint({
      'config': 'scss-lint.yml'
    }))
})

gulp.task('styles', function() {
    
    var sassOptions = {
        outputStyle: 'compressed'
    }

    var processors = [
        autoprefixer({ 
            browsers: [
                'last 2 versions'
            ]
        })
    ]

    return gulp.src(paths.src + paths.css + '*.scss')
        .pipe(plumber()) // onerror won't break gulp task
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(concat('style.css'))
        .pipe(gap.prependFile([
            paths.src + paths.css + 'vendor/bootstrap.min.css'           
        ]))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.dist + paths.css))
})

gulp.task('styles:watch', function() {
	gulp.watch(paths.src + paths.css + '**/*.scss', ['styles'])
})

gulp.task('scripts', function() {
	
    return gulp.src(paths.src + paths.js + '*.js')
        .pipe(plumber()) 
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gap.prependFile([
            paths.src + paths.js + 'vendor/jquery-2.1.4.min.js',
            paths.src + paths.js + 'vendor/bootstrap.min.js'            
        ]))
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.dist + paths.js))
})

gulp.task('scripts:watch', function() {
	gulp.watch(paths.src + paths.js + '**/*.js', ['scripts'])
})

gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
  .pipe(imagemin())
  .pipe(gulp.dest('dist/images'))
});

gulp.task('images:watch', function() {
    gulp.watch(paths.src + '**/*.+(png|jpg|gif|svg)', ['images'])
})

gulp.task('html', function() {
	
    return gulp.src(paths.src + '*.html')
        .pipe(replace('<% header %>', fs.readFileSync(paths.src + paths.templates + 'header.html')))
        .pipe(replace('<% footer %>', fs.readFileSync(paths.src + paths.templates + 'footer.html')))
        .pipe(replace('<% buttons %>', fs.readFileSync(paths.src + paths.templates + 'button.html')))
		.pipe(gulp.dest(paths.dist))
})

gulp.task('html:watch', function() {
	gulp.watch(paths.src + '**/*.html', ['html'])
})

gulp.task('static', function() {
    
    return gulp.src(staticFiles, {
            base: paths.src
        })
        .pipe(gulp.dest(paths.dist));
})

gulp.task('static:watch', function() {
	gulp.watch(staticFiles, ['static'])
})

gulp.task('bump', function() {
	return gulp.src(['./bower.json', './package.json'])
			.pipe(bump({
				type: 'patch'
			}))
			.pipe(gulp.dest(paths.dist))
})

gulp.task('build', function() {
	runSequence('clean', ['scripts', 'scss-lint', 'styles', 'images', 'html', 'static']);
})

gulp.task('dev', ['styles:watch', 'scripts:watch', 'images:watch', 'html:watch', 'static:watch'])

