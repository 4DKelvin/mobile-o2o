var walk = require('./gulp-walk'),
    gulp = require('gulp'),
    inject = require('gulp-inject'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify-css'),
    bowerfile = require('main-bower-files'),
    rev = require('gulp-rev'),
    path = require('path'),
    uglify = require('gulp-uglify'),
    html = require('gulp-htmlmin'),
    string = require('gulp-inject-string'),
    base64 = require('gulp-base64'),
    sass = require('gulp-sass'),
    nodemon = require("gulp-nodemon"),
    del = require('del'),
    gulpif = require('gulp-if'),
    build = process.argv[process.argv.length - 1] != 'serve',
    dir = {
        source: './assets',
        dist: build ? './dist' : './serve'
    },
    buildHtml = function () {
        walk(path.join(dir.source + '/views')).then(function (results) {
            var modules = {},
                rs = results[dir.source.replace('./', '')]['views'];
            for (var module in rs) {
                modules[module] = [];
                for (var temp in rs[module]['templates']) {
                    modules[module].push(rs[module]['templates'][temp]);
                }
            }
            for (var module in modules) {
                for (var file in rs[module]) {
                    if (file.indexOf('.html') != -1) {
                        gulp.src([path.join(dir.source) + '/views/header.html'].concat(modules[module].concat([rs[module][file], path.join(dir.source) + '/views/footer.html', path.join(dir.source + '/views/' + module + '/*.js')])))
                            .pipe(string.after('<!-- inject:js --><!-- endinject -->', '<script type="text/javascript">'))
                            .pipe(concat(file))
                            .pipe(string.append('</script>'))
                            .pipe(inject(
                                gulp.src(path.join(dir.dist + '/library/*.js'))
                                , {name: 'bower'}))
                            .pipe(inject(gulp.src([path.join(dir.dist + '/commons/*.js'), path.join(dir.dist + '/css/*.css')], {read: false})))
                            .pipe(string.replace(path.join(dir.dist) + '/', ''))
                            .pipe(string.replace('<body>', '<body ng-app="' + module + '">'))
                            .pipe(gulpif(build, html({
                                removeComments: true,  //清除HTML注释
                                collapseWhitespace: true,  //压缩HTML
                                collapseBooleanAttributes: true,  //省略布尔属性的值 <input checked="true"/> ==> <input checked />
                                removeEmptyAttributes: true,  //删除所有空格作属性值 <input id="" /> ==> <input />
                                removeScriptTypeAttributes: true,  //删除<script>的type="text/javascript"
                                removeStyleLinkTypeAttributes: true,  //删除<style>和<link>的type="text/css"
                                minifyJS: true,  //压缩页面JS
                                minifyCSS: true  //压缩页面CSS
                            })))
                            .pipe(gulp.dest(path.join(dir.dist) + '/' + module))
                    }
                }

            }
        });
    };


gulp.task('serve', ['default'], function () {
    gulp.watch(path.join(dir.source + '/stylesheets/*.scss'), ['graphics', 'html']);
    gulp.watch(path.join(dir.source + '/commons/*.js'), ['structure', 'html']);
    gulp.watch(path.join(dir.source + '/**/*.html'), ['html']);
    gulp.watch(path.join(dir.source + '/**/*.js'), ['html']);
    return nodemon({
        script: 'gulp-serve.js',
        ext: 'js html',
        env: {
            'NODE_ENV': 'development'
        }
    });
});

gulp.task('clean', function () {
    del(path.join(dir.dist + '/*'));
});

gulp.task('graphics', function () {
    return gulp.src(path.join(dir.source + '/stylesheets/*.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(base64({baseDir: path.join(dir.source)}))
        .pipe(gulpif(build, concat('mobile-h5.css')))
        .pipe(gulpif(build, minify()))
        .pipe(gulpif(build, rev()))
        .pipe(gulp.dest(path.join(dir.dist + '/css')));
});
gulp.task('structure', function () {
    return gulp.src(path.join(dir.source + '/commons/*.js'))
        .pipe(gulpif(build, concat('mobile-h5.js')))
        .pipe(gulpif(build, uglify()))
        .pipe(gulpif(build, rev()))
        .pipe(gulp.dest(path.join(dir.dist + '/commons')));
});
gulp.task('library', function () {
    return gulp.src(bowerfile())
        .pipe(concat('app-library.js'))
        .pipe(gulpif(build, uglify()))
        .pipe(gulpif(build, rev()))
        .pipe(gulp.dest(path.join(dir.dist + '/library')))
});

gulp.task('html', buildHtml);

gulp.task('default', ['clean', 'structure', 'library', 'graphics'], buildHtml);