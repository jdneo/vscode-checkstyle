'use strict';

import { createWriteStream, pathExists, remove, rename } from 'fs-extra';
import * as path from 'path';
import * as request from 'request';
// tslint:disable-next-line:no-require-imports no-var-requires typedef
const progress = require('request-progress');
import { MessageType, ShowMessageNotification } from 'vscode-languageserver';
import { DownloadCheckstyleError } from './errors';
import {
    DownloadStartNotification,
    DownloadStatus,
    DownloadStatusNotification,
    VersionInvalidNotification
} from './notifications';

export async function downloadCheckstyle(connection: any, downloadPath: string, version: string, textDocumentUri: string): Promise<boolean> {
    const checkstyleJar: string = `checkstyle-${version}-all.jar`;
    const downloadLink: string = `https://sourceforge.net/projects/checkstyle/files/checkstyle/${version}/${checkstyleJar}/download`;
    if (!(await isValidVersionNumber(downloadLink, connection, textDocumentUri))) {
        return false;
    }

    const tempFileName: string = `${checkstyleJar}.download`;
    const tempFilePath: string = path.join(downloadPath, tempFileName);
    if (await pathExists(tempFilePath)) {
        await remove(tempFilePath);
    }

    return await new Promise((resolve: (res: boolean) => void, _reject: (e: Error) => void): void => {
        connection.sendNotification(DownloadStartNotification.notificationType);
        progress(request(downloadLink, { timeout: 20 * 1000 /*wait for 20 seconds*/ }))
            .on('progress', (state: any) => {
                connection.sendNotification(
                    DownloadStatusNotification.notificationType,
                    {
                        downloadStatus: DownloadStatus.downloading,
                        // tslint:disable-next-line:no-string-literal
                        percent: Math.round(state['percent'] * 100)
                    }
                );
            })
            .on('error', (err: any) => {
                connection.sendNotification(
                    DownloadStatusNotification.notificationType,
                    {
                        downloadStatus: DownloadStatus.error,
                        // tslint:disable-next-line:no-string-literal
                        error: new DownloadCheckstyleError(`Download Checkstyle fail: ${err['code'] || err.toString()}`),
                        downloadLink
                    }
                );
                resolve(false);
            })
            .on('end', async () => {
                await rename(tempFilePath, path.join(downloadPath, checkstyleJar));
                connection.sendNotification(
                    DownloadStatusNotification.notificationType,
                    {
                        downloadStatus: DownloadStatus.finished
                    }
                );
                resolve(true);
            }).pipe(createWriteStream(tempFilePath));
    });
}

async function isValidVersionNumber(url: string, connection: any, textDocumentUri: string): Promise<boolean> {
    return await new Promise((resolve: (ret: boolean) => void): void => {
        request(
            {
                method: 'GET',
                uri: url,
                followRedirect: false,
                timeout: 10 * 1000 /*wait for 10 seconds*/
            },
            (_error: any, response: request.RequestResponse, _body: any): void => {
                if (!response || _error) {
                    connection.sendNotification(ShowMessageNotification.type, { type: MessageType.Error, message: 'Failed to download CheckStyle, please try again later.' });
                    resolve(false);
                } else {
                    if (response.statusCode === 302) {
                        resolve(true);
                    } else {
                        connection.sendNotification(VersionInvalidNotification.notificationType, { uri: textDocumentUri });
                        resolve(false);
                    }
                }
            });
    });
}
