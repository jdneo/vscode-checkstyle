'use strict';

import { createWriteStream, pathExists, remove, rename } from 'fs-extra';
import * as path from 'path';
import * as request from 'request';
// tslint:disable-next-line:no-require-imports no-var-requires typedef
const progress = require('request-progress');
import { OutputChannel } from 'vscode';

export async function downloadCheckstyle(outputChannel: OutputChannel, downloadPath: string, version: string): Promise<void> {
    const checkstyleJar: string = `checkstyle-${version}-all.jar`;
    const tempFileName: string = `${checkstyleJar}.download`;
    const tempFilePath: string = path.join(downloadPath, tempFileName);
    if (await pathExists(tempFilePath)) {
        await remove(tempFilePath);
    }
    outputChannel.appendLine(`Fetching the download link for ${checkstyleJar}...`);
    const downloadLink: string = `https://sourceforge.net/projects/checkstyle/files/checkstyle/${version}/${checkstyleJar}/download`;
    const barLength: number = 20;
    await new Promise((resolve: () => void, reject: (e: Error) => void): void => {
        progress(request(downloadLink))
        // tslint:disable-next-line:no-any
        .on('progress', (state: any) => {
            // tslint:disable-next-line:no-string-literal
            const completeness: number = state['percent'] * 100 / 5;
            // tslint:disable-next-line:no-string-literal
            const output: string = `Downloading [${'='.repeat(completeness)}${' '.repeat(barLength - completeness)}] ${Math.round(state['percent'] * 100)}%`;
            outputChannel.appendLine(output);
        })
        .on('error', (err: Error) => {
            reject(err);
        })
        .on('end', () => {
            outputChannel.appendLine(`Downloading [${'='.repeat(barLength)}] 100%`);
            outputChannel.appendLine('Download Finished.');
            rename(tempFilePath, path.join(downloadPath, checkstyleJar));
            resolve();
        }).pipe(createWriteStream(tempFilePath));
    });
}
