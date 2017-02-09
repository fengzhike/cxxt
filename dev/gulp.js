/**
 * Created by lchysh on 14-10-28.
 */
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var path = require('path');
var fs = require('fs');
var watch = require('gulp-watch');
var root = path.dirname(__dirname);
//var bsrss =
//    [
//    "resource/js/plugin/animate/animate.js",
//    "resource/js/plugin/chart/radar/radar.js",
//    "resource/js/view.js",
//    "resource/js/unionSupport.js",
//    "resource/js/dataModel.js",
//    "resource/js/main.js"];
var bsrss = [
    "resource/js/urming.js"];
var srcs = [];
bsrss.forEach(function (item) {
    srcs.push(path.join(root, item));
});
console.log(srcs);

gulp.task('scripts', function () {
    console.log('scripts');
    gulp.src(srcs)
        .pipe(uglify())
        .pipe(concat('urming.min.js'))
        .pipe(gulp.dest(path.join(root, 'resource/js/')))
});
gulp.watch(srcs, ['scripts']);
var cssArr = [path.join(root, 'resource/css/*.scss')];

//gulp.task('scss', function () {
//    console.log('scss');
//    gulp.src(cssArr)
//        .pipe(sass({outputStyle: 'compressed'}))
//        .on('error', function (e) {
//                console.error(e);
//            })
//        .pipe(gulp.dest(path.join(root, 'resource/css/')))
//});
watch(cssArr, function(e){
    console.log(e.path);
    gulp.src(e.path)
        .pipe(sass({outputStyle: 'compressed'}))
        .on('error', function (e) {
            console.error(e);
        })
        .pipe(gulp.dest(path.join(root, 'resource/css/')))
});


//gulp.src('/home/lchysh/work/WebstormProjects/urming/edu/resource/js/plugin/chart/radar/radar.js')
//    .pipe(uglify())
//    .pipe(concat('radar.min.js'))
//    .pipe(gulp.dest('/home/lchysh/work/WebstormProjects/urming/edu/resource/js/plugin/chart/radar'))