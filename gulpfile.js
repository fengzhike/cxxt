/**
 * Created by fsk on 2016/3/14.
 */
//const gulp = require('gulp');
//帮我们执行重复操作
var gulp = require('gulp'),
    connect = require('gulp-connect');
// 引入组件
//htmlmin = require('gulp-htmlmin'), //html压缩
//imagemin = require('gulp-imagemin'),//图片压缩
//pngcrush = require('imagemin-pngcrush'),
var minifycss = require('gulp-minify-css'),//css压缩
    sass = require('gulp-sass'),
    path = require('path'),
    watch = require('gulp-watch'),
    jshint = require('gulp-jshint'),//js检测
    uglify = require('gulp-uglify'),//js压缩
    concat = require('gulp-concat'),//文件合并
    rename = require('gulp-rename'),//文件更名
    notify = require('gulp-notify');//提示信息

/*// 压缩html
 gulp.task('html', function() {
 return gulp.src('src*//*.html')
 .pipe(htmlmin({collapseWhitespace: true}))
 .pipe(gulp.dest('./dest'))
 .pipe(notify({ message: 'html task ok' }));

 });*/

/*// 压缩图片
 gulp.task('img', function() {
 return gulp.src('src/images*//*')
 .pipe(imagemin({
 progressive: true,
 svgoPlugins: [{removeViewBox: false}],
 use: [pngcrush()]
 }))
 .pipe(gulp.dest('./dest/images/'))
 .pipe(notify({ message: 'img task ok' }));
 });*/

//编译sass
gulp.task('sass_com',function(){
    gulp.src('resource/css/*.scss')
        .pipe(sass())
        //.pipe(gulp.dest('dest/css'))
        //.pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('resource/css'))
        .pipe(notify({ message: 'sass task ok' }));
})
//服务器
/*gulp.task('connect', function () {
  connect.server({
    root: 'www',
    livereload: true
  });
});*/
gulp.task('connect',function(){
    connect.server({/*
        root:'./',  
        ip:'192.168.31.110',*/
        livereload:true
    })
})
// 合并、压缩、重命名css
/*gulp.task('css', function() {
 return gulp.src('src/css*//*.css')
 .pipe(concat('main.css'))
 .pipe(gulp.dest('./dest/css'))
 .pipe(rename({ suffix: '.min' }))
 .pipe(minifycss())
 .pipe(gulp.dest('dest/css'))
 .pipe(notify({ message: 'css task ok' }));
 });*/
///js
var bsrss =
    [
        "resource/js/plugin/animate/animate.js",
        "resource/js/plugin/chart/radar/radar.js",
        "resource/js/view.js",
        "resource/js/unionSupport.js",
        "resource/js/dataModel.js",
        "resource/js/main.js"
    ];

// 合并、压缩js文件

gulp.task('js', function() {
// 检查js
/*gulp.task('lint', function() {
 return gulp.src(bsrss)
 .pipe(jshint())
 .pipe(jshint.reporter('default'))
 .pipe(notify({ message: 'lint task ok' }));
 });*/
    gulp.src(bsrss)
        .pipe(concat('urming.js'))
        .pipe(gulp.dest('./resource/js/'))
        .pipe(rename({ suffix:'.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('resource/js/'))
        .pipe(notify({ message: 'js task ok' }))
        //.pipe(connect.reload());
})
/*gulp.task('html', function(){
  gulp.src('./src/*.html')
      //.pipe(connect.reload());
})*/
gulp.task('watch', function () {
    gulp.watch(bsrss,['js']);
    //gulp.watch('./*.html',['html']);
    watch('resource/css/*.scss',function(e){
        //console.log(e.path);
        gulp.src(e.path)
            .pipe(sass())
            //.pipe(minifycss())
            .pipe(gulp.dest('resource/css'))
            .pipe(notify({ message: 'check sass task ok' }))
            //.pipe(connect.reload());
    })
});
// 默认任务
gulp.task('default',['connect','watch']);