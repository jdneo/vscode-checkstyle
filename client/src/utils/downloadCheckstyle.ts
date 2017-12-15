'use strict';

import { createWriteStream, pathExists, remove, rename } from 'fs-extra';
import * as path from 'path';
import * as request from 'request';
// tslint:disable-next-line:no-require-imports no-var-requires typedef
const progress = require('request-progress');
import {
    Progress,
    ProgressLocation,
    window
} from 'vscode';

export async function downloadCheckstyle(downloadPath: string, version: string): Promise<void> {
    const checkstyleJar: string = `checkstyle-${version}-all.jar`;
    const tempFileName: string = `${checkstyleJar}.download`;
    const tempFilePath: string = path.join(downloadPath, tempFileName);
    if (await pathExists(tempFilePath)) {
        await remove(tempFilePath);
    }
    const downloadLink: string = `https://sourceforge.net/projects/checkstyle/files/checkstyle/${version}/${checkstyleJar}/download`;
    window.withProgress({ location: ProgressLocation.Window }, async (p: Progress<{}>) => {
        return new Promise((resolve: () => void, reject: (e: Error) => void): void => {
            p.report({ message: `Fetching the download link for ${checkstyleJar}...` });
            progress(request(downloadLink))
                .on('progress', (state: any) => {
                    // tslint:disable-next-line:no-string-literal
                    const output: string = `Downloading ${checkstyleJar}... ${Math.round(state['percent'] * 100)}%`;
                    p.report({ message: output });
                })
                .on('error', (err: Error) => {
                    reject(err);
                })
                .on('end', () => {
                    rename(tempFilePath, path.join(downloadPath, checkstyleJar));
                    resolve();
                }).pipe(createWriteStream(tempFilePath));
        });
    });
}
