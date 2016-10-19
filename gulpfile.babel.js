import fs from 'fs';
import gulp from 'gulp';
import * as gUtil from 'gulp-util';
import * as browserSync from 'browser-sync';
import url from 'url';
import path from 'path';
import juicer from 'juicer';
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

function getPageIndex(dir) {
    return getDemoList(dir)
        .then(function (files) {
            let demoFiles = files.filter(function (file) {
                return file.indexOf('.') === -1;
            })
            return new Promise(function (resolve, reject) {
                fs.readFile('./tpl.html', 'utf-8', function (err, str) {
                    if (err) {
                        reject(err);
                    }
                    str = juicer(str, { demoItems: demoFiles, rootUrl: rootUrl });
                    resolve(str);
                })
            })
        })
        .then(function (str) {
            let writeFile = path.join(dir,'index.html');
            fs.writeFile(writeFile, str, function () {
                gUtil.log(`create ${writeFile} success!!`);
            });
        });
}

gulp.task('default', function (done) {
    getPageIndex('./CSS3UI');
    return getPageIndex('./');
})

gulp.task('serve', function () {

    browserSync.init({
        server: "./"
    });

    gulp.watch("./**/*.html").on('change', browserSync.reload);
});