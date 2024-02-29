// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

const path = require('path');
const https = require('https');
const fs = require('fs');
const fse = require('fs-extra');
const cp = require('child_process');

(async () => {
  await downloadCheckstyleJar();
  buildBundle();
})();

async function downloadCheckstyleJar() {
  const downloadDir = path.join(__dirname, '..', 'server');
  await fse.ensureDir(downloadDir);
  const checkstyleVersion = require('../package.json')['contributes']['configuration']['properties']['java.checkstyle.version']['default'];
  const dest = path.join(downloadDir, `checkstyle-${checkstyleVersion}-all.jar`);
  await download(`https://github.com/checkstyle/checkstyle/releases/download/checkstyle-${checkstyleVersion}/checkstyle-${checkstyleVersion}-all.jar`, dest);
}

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, async function(response) {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        const file = fs.createWriteStream(dest);
        file.on('finish', function() {
          file.close();
          return resolve();
        });
        file.on('error', function(err) {
          fs.unlink(dest);
          reject(err);
        });
        response.pipe(file);
      } else if (response.headers.location) {
        await download(response.headers.location, dest);
        return resolve();
      } else {
        reject(new Error(response.statusCode + ' : ' + response.statusMessage));
      }
    });
  });
}

function buildBundle() {
  const serverDir = path.join(__dirname, '..', 'jdtls.ext');
  cp.execSync(`${mvnw()} clean verify`, { cwd: serverDir, stdio: [0, 1, 2] });
  copy(path.join(serverDir, 'com.shengchen.checkstyle.checker/target'), path.resolve('server'));
  copy(path.join(serverDir, 'com.shengchen.checkstyle.runner/target'), path.resolve('server'));
}

function copy(sourceFolder, targetFolder) {
  const jars = fse.readdirSync(sourceFolder).filter(file => path.extname(file) === '.jar');
  fse.ensureDirSync(targetFolder);
  for (const jar of jars) {
    // remove version from name
    const renamedJar = path.basename(jar).substring(0, path.basename(jar).lastIndexOf('-')) + '.jar';
    fse.copyFileSync(path.join(sourceFolder, jar), path.join(targetFolder, renamedJar));
  }
}

function isWin() {
  return /^win/.test(process.platform);
}

function mvnw() {
  return isWin() ? 'mvnw.cmd' : './mvnw';
}
