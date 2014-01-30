var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    minifyCSS = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    lr = require('tiny-lr'),
    watch = require('gulp-watch'),
    livereload = require('gulp-livereload'),
    open = require("gulp-open"),
    server = lr(),
    connect = require('connect'), 
    http = require('http'), 
    sass = require('gulp-sass'),
    runSequence = require('run-sequence');


gulp.task('lint', function() {
  return gulp.src('./app/scripts/app.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('clean', function() {
   return gulp.src('./build/', {read: false})
        .pipe(clean());
});

gulp.task('browserify', function() {
   return gulp.src(['./app/scripts/app.js'])
        .pipe(browserify({
          insertGlobals : true,
          debug : true,
          shim: {
            'angular': {
                path: 'app/bower_components/angular/angular.js',
                exports: 'angular'
            },
            'angular-route': {
                path: 'app/bower_components/angular-route/angular-route.js',
                exports: 'ngRoute',
                depends: {
                    angular: 'angular'
                }
            },
            bootstrap: {
                path: 'app/bower_components/bootstrap-sass/dist/js/bootstrap.js',
                exports: null,
                depends:{
                  jquery: 'jquery'
                }
            },
            'jquery': {
                path: 'app/bower_components/jquery/jquery.js',
                exports: '$'
            }
          }
        }))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./build/scripts'))
});

gulp.task('sassMyShit', function(){
  return  gulp.src('app/styles/*.scss')
        .pipe(sass({                      // Dictionary of render options
                includePaths: [
                    './app/bower_components/bootstrap-sass/lib/',
                    '../bower_components/bootstrap-sass/lib/'
                ]
            }))
        .pipe(gulp.dest('./build/styles'));
});

gulp.task('minify-css', function() {
  gulp.src('./app/styles/**/**.css')
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('minify-html', function() {
  gulp.src('./app/views/*.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('./dist'))
});

gulp.task('imagemin', function () {
    gulp.src('app/images/**.{png,svg,jpeg,gif,jpg}')
        .pipe(imagemin())
        .pipe(gulp.dest('dist'));
});

//TODO add support for source maps
gulp.task('minify-js', function() {
  gulp.src('./app/scripts/**/*.js')
    .pipe(uglify({
            // inSourceMap: 
            // outSourceMap: "app.js.map"
    }))
    .pipe(gulp.dest('./dist/scripts'))
});

gulp.task('watch', function(){
 return  gulp.src('app/**.**')
        .pipe(watch())
        .pipe(livereload(server));
});

gulp.task("server", function(){
    var options = {
        url: "http://localhost:8888"
    };
    var app = connect()
            .use(connect.logger('dev'))
            .use(connect.static('app'))
            .use(connect.static('build'));

    http.createServer(app).listen(8888);

   return gulp.src("./app/index.html")
        .pipe(open("", options));
});

//Default task,. For minify use gulp-minify-
gulp.task('default', function(){
   runSequence('clean', ['browserify', 'lint','sassMyShit', 'watch' ,'server']);
});

gulp.task('build', function(){
  gulp.run('clean', 'browserify', 'lint', 'minify-js');
});