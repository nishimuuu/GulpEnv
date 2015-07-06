///////////////////////////////////////
// load plugin part
//
// gulp
var gulp         = require('gulp');

//file lint
var htmlhint     = require('gulp-htmlhint');
var csslint      = require('gulp-csslint');
var jshint       = require('gulp-jshint');

//for scss/sass/css
var sass         = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

//for jade
var jade         = require('gulp-jade');

//for coffee
var coffee       = require('gulp-coffee');

//for javascript
var uglify       = require('gulp-uglify');
var concat       = require('gulp-concat');

//other useful plugins
var cache        = require('gulp-cached');
var plumber      = require('gulp-plumber');
var frontNote    = require('gulp-frontnote');
var notify       = require('gulp-notify');
var watch        = require('gulp-watch');

//webserver
var webserver    = require('gulp-webserver');
var livereload   = require('gulp-livereload');

///////////////////////////////////////
// Task describe part
var errorMsg = "Error <%= error.message %>"

// Task of sass/css
gulp.task('sass', function() {

  gulp.src('src/sass/**')
    .pipe(cache('sass'))
    .pipe(plumber({
      errorHandler : notify.onError(errorMsg)
    }))
    .pipe(frontNote({
      css: 'static/css/style.css'  
    }))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('static/css'))
    .pipe(livereload());
});

// Task of coffee/js
gulp.task('js', function(){

  //compile coffee to js
  gulp.src('src/coffee/global/*.coffee')
    .pipe(plumber({
      errorHandler : notify.onError(errorMsg)
    }))
    .pipe(coffee())
    .pipe(gulp.dest('static/js/global/'));
  
  gulp.src('src/coffee/local/*.coffee')
    .pipe(plumber({
      errorHandler : notify.onError(errorMsg)
    }))
    .pipe(coffee())
    .pipe(gulp.dest('static/js/local/'));

  //minify js
  gulp.src(['static/js/global/**','!static/js/min/**/*.js'])
    .pipe(concat('global.js'))  
    .pipe(plumber({
      errorHandler : notify.onError(errorMsg)
    }))
     .pipe(uglify())
     .pipe(gulp.dest('static/js/min/'));

  gulp.src(['static/js/local/**','!static/js/min/**/*.js'])
    .pipe(concat('local.js'))  
    .pipe(plumber({
      errorHandler : notify.onError(errorMsg)
    }))
     .pipe(uglify())
     .pipe(gulp.dest('static/js/min'));

  //compile jade to html
  gulp.src('src/jade/**')
    .pipe(plumber({
      errorHandler : notify.onError(errorMsg)
    }))
    .pipe(jade({
      pretty:true
      }))
    .pipe(gulp.dest('static/html/'));
});


//To launch webserver::port::24666
gulp.task('webserver', function(){
  gulp.src('static/html')
  .pipe(webserver({
    livereload: true,
    port: 24666
    }));
});

//Validate html, css, js
gulp.task('validate', function(){
   gulp.src('static/html/*.html')
   .pipe(htmlhint())
   .pipe(htmlhint.reporter())
   .pipe(htmlhint.failReporter());

   gulp.src('static/js/min/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'));

  gulp.src('static/css/*.css')
  .pipe(csslint())
  .pipe(csslint.reporter());
});
////////////////////////////////////////
// watch target part
//Watch task
gulp.task('watch', function(){
  gulp.watch(['static/**/*.js','!static/js/min/**/*.js'],function(e){
  watch(['static/**/*.js','!static/js/min/**/*.js'],function(e){
    gulp.start('js');
    })
  });
  gulp.watch(['src/**/*.scss'],function(e){
    watch(['src/**/*.scss'],function(e){
      gulp.start('sass');
    });
  });
  gulp.watch(['src/**/*.coffee','src/**/*.jade'],function(e){
  watch(['src/**/*.coffee','src/**/*.jade'],function(e){
      gulp.start('js');
    });
  });


  gulp.watch(['static/**/**'],function(e){
    gulp.start('validate');
  });
})

//Run
gulp.task('default', ['webserver', 'watch'])
