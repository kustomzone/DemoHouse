const fs = require('fs');
const gulp = require('gulp');
const gUtil = require('gulp-util');
const browserSync = require('browser-sync').create();
const juicer = require('juicer');
const url = require('url');
const rootUrl = '';

function getDemoList(dir) {
    return new Promise(function (resolve, reject) {
        fs.readdir(dir, function (err, files) {
            if (err) {
                reject(err);
            }
            if (Array.isArray(files)) {
                resolve(files)
            }
        })
    })
}

function getPageIndex() {
    return getDemoList('./')
        .then(function (files) {
            let demoFiles = files.filter(function (file) {
                return file.indexOf('.') === -1;
            })
            return new Promise(function (resolve, reject) {
                fs.readFile('./index.tpl', 'utf-8', function (err, str) {
                    if (err) {
                        reject(err);
                    }
                    str = juicer(str, { demoItems: demoFiles, rootUrl:rootUrl });
                    resolve(str);
                })
            })
        });
}

gulp.task('default', function (done) {
    getPageIndex()
    .then(function(str){
        fs.writeFile('./index.html',str,function(){
            done();
        });
    });
})

gulp.task('serve', function () {

    browserSync.init({
        server: "./",
        middleware: function (req, res, next) {
            let urlObj = url.parse(req.originalUrl);
            if (urlObj.pathname === '/') {
                getPageIndex()
                    .then(function (str) {
                        res.write(str);
                        res.end();
                    }, function () {
                        res.write('error!!!');
                        res.end();
                    })
            }
            else {
                return next();
            }
        }
    });

    gulp.watch("./**/*.html").on('change', browserSync.reload);
});