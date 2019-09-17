// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

const gulp = require('gulp');
const cp = require('child_process');
const tslint = require('gulp-tslint');
const decompress = require('gulp-decompress');
const path = require('path');
const fse = require('fs-extra');
const os = require('os');
const remoteSrc = require('gulp-remote-src');
const rename = require('gulp-rename');

const serverDir = path.join(__dirname, 'jdtls.ext');
const vscodeExtensionsPath = path.join(os.homedir(), '.vscode', 'extensions');

// Build required jar files.
const checkstyleVersion = require('./package.json')['contributes']['builtinVersion'];
gulp.task('download-checkstyle', (done) => {
    remoteSrc([`checkstyle-${checkstyleVersion}-all.jar`], { base: `https://github.com/checkstyle/checkstyle/releases/download/checkstyle-${checkstyleVersion}/` })
        .pipe(gulp.dest('./server/checkstyle/lib'))
        .pipe(rename('checkstyle-all.jar'))
        .pipe(gulp.dest(path.join(serverDir, 'com.shengchen.checkstyle.runner', 'lib')))
        .on('end', done);
});

gulp.task('build-jar', (done) => {
    cp.execSync(`${mvnw()} clean package`, { cwd: serverDir, stdio: [0, 1, 2] });
    const targetDir = path.join(serverDir, 'com.shengchen.checkstyle.runner/target');
    gulp.src(path.join(targetDir, '*.jar'))
        .pipe(gulp.dest('./server'));
    gulp.src(path.join(targetDir, '.checker-classes/**/*.class'))
        .pipe(gulp.dest('./server/checkstyle'));
    done();
});

gulp.task('build-plugin', gulp.series('download-checkstyle', 'build-jar'));

// Lint
gulp.task('checkstyle', (done) => {
    cp.execSync(`${mvnw()} verify`, { cwd: serverDir, stdio: [0, 1, 2] });
    done();
});

gulp.task('tslint', (done) => {
    gulp.src(['**/*.ts', '!**/*.d.ts', '!node_modules/**', '!./src/views/node_modules/**'])
        .pipe(tslint())
        .pipe(tslint.report());
    done()
});

gulp.task('lint', gulp.series('checkstyle', 'tslint'));

// For test
gulp.task('install-java-language-server', async (done) => {
    await installExtension('redhat', 'java', '0.31.0');
    done();
});

async function installExtension(publisher, identifier, version) {
    const extensionPath = path.join(vscodeExtensionsPath, `${publisher}.${identifier}-${version}`);
    if (!await fse.pathExists(extensionPath)) {
        return download(`http://ms-vscode.gallery.vsassets.io/_apis/public/gallery/publisher/${publisher}/extension/${identifier}/${version}/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage`)
            .pipe(decompress({
                filter: file => file.path.startsWith('extension/'),
                map: file => {
                    file.path = file.path.slice('extension/'.length);
                    return file;
                }
            }))
            .pipe(gulp.dest(extensionPath));
    } else {
        console.log(`${publisher}.${identifier}-${version} already installed.`);
    }
}

function isWin() {
    return /^win/.test(process.platform);
}

function mvnw() {
    return isWin() ? 'mvnw.cmd' : './mvnw';
}
