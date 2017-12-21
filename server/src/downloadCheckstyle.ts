'use strict';

import { createWriteStream, pathExists, remove, rename } from 'fs-extra';
import * as path from 'path';
import * as request from 'request';
// tslint:disable-next-line:no-require-imports no-var-requires typedef
const progress = require('request-progress');
import { IncomingMessage } from 'http';
import { UpdateSettingParamsRequest } from './serverRequests';
import { DownloadStartRequest, DownloadStatus, DownloadStatusRequest } from './serverRequests';

export async function downloadCheckstyle(connection: any, downloadPath: string, version: string, textDocumentUri: string): Promise<boolean> {
    const checkstyleJar: string = `checkstyle-${version}-all.jar`;
    const downloadLink: string = `https://sourceforge.net/projects/checkstyle/files/checkstyle/${version}/${checkstyleJar}/download`;
    if (!(await isValidVersionNumber(downloadLink))) {
        connection.sendRequest(UpdateSettingParamsRequest.requestType, { uri: textDocumentUri });
        return false;
    }

    const tempFileName: string = `${checkstyleJar}.download`;
    const tempFilePath: string = path.join(downloadPath, tempFileName);
    if (await pathExists(tempFilePath)) {
        await remove(tempFilePath);
    }

    return await new Promise((resolve: (res: boolean) => void, _reject: (e: Error) => void): void => {
        connection.sendRequest(DownloadStartRequest.requestType);
        progress(request(downloadLink, { timeout: 10 * 1000 /*wait for 10 seconds*/ }))
            .on('progress', (state: any) => {
                connection.sendRequest(
                    DownloadStatusRequest.requestType,
                    {
                        downloadStatus: DownloadStatus.downloading,
                        // tslint:disable-next-line:no-string-literal
                        percent: Math.round(state['percent'] * 100)
                    }
                );
            })
            .on('error', (err: Error) => {
                connection.sendRequest(
                    DownloadStatusRequest.requestType,
                    {
                        downloadStatus: DownloadStatus.error,
                        err
                    }
                );
                resolve(false);
            })
            .on('end', async () => {
                await rename(tempFilePath, path.join(downloadPath, checkstyleJar));
                connection.sendRequest(
                    DownloadStatusRequest.requestType,
                    {
                        downloadStatus: DownloadStatus.finished
                    }
                );
                resolve(true);
            }).pipe(createWriteStream(tempFilePath));
    });
}

async function isValidVersionNumber(url: string): Promise<boolean> {
    return await new Promise((resolve: (ret: boolean) => void): void => {
        request({
            method: 'GET',
            uri: url,
            followRedirect: false
        })
            .on('response', (response: IncomingMessage) => {
                if (response.statusCode === 302) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
    });
}
