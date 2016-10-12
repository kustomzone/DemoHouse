const fs = require('fs');
const gulp = require('gulp');
const gUtil = require('gulp-util');
const browserSync = require('browser-sync').create();
const juicer = require('juicer');
const url = require('url');

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
                fs.readFile('./index.html', 'utf-8', function (err, str) {
                    if (err) {
                        reject(err);
                    }
                    str = juicer(str, { demoItems: demoFiles });
                    resolve(str);
                })
            })
        });
}

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