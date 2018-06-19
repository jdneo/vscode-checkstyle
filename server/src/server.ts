'use strict';

import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as request from 'request';
import URI from 'vscode-uri';
// tslint:disable-next-line:no-require-imports no-var-requires typedef
const progress = require('request-progress');
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { ConfigurationType, ICheckStyleSettings } from './checkstyleSetting';
import { Connector } from './connector';
import { cpUtils } from './cpUtils';
import { DocumentConfigProvider } from './DocumentConfigProvider';
import { DownloadCheckstyleError, getErrorMessage, InvalidVersionError, VersionNotExistError } from './errors';
import { CheckStatus, CheckStatusNotification, DownloadStartNotification, DownloadStatus, DownloadStatusNotification, ErrorNotification, ServerStatus, VersionCheckNotification, VersionCheckResult } from './notifications';

export class Server {
    private _serverStatus: ServerStatus;
    private _connector: Connector;
    private _documents: DocumentConfigProvider;
    private _checkstyleResourcePath: string;

    constructor(connector: Connector, documents: DocumentConfigProvider) {
        this._serverStatus = ServerStatus.stopped;
        this._connector = connector;
        this._documents = documents;
        this._checkstyleResourcePath = path.join(os.homedir(), '.vscode', 'vscode-checkstyle', 'resources');
    }

    public get serverStatus(): ServerStatus {
        return this._serverStatus;
    }

    public bindListeners(): void {
        this._connector.on('initialized', () => {
            this._serverStatus = ServerStatus.running;
        });

        this._connector.on('requestCheck', async (uri: string) => {
            const settings: ICheckStyleSettings = await this._documents.getDocumentSettings(uri);
            this.checkCode(uri, settings);
        });

        this._documents.on('requestCheck', async (uri: string) => {
            const settings: ICheckStyleSettings = await this._documents.getDocumentSettings(uri);
            if (settings.autocheck) {
                this.checkCode(uri, settings);
            }
        });
    }

    private async checkCode(uri: string, settings: ICheckStyleSettings): Promise<void> {
        if (this.serverStatus !== ServerStatus.running) {
            return;
        }
        this._connector.connection.sendNotification(CheckStatusNotification.notificationType, { uri, state: CheckStatus.wait });
        let result: string;
        try {
            result = await this.checkstyle(settings, URI.parse(uri).fsPath);
        } catch (error) {
            if (error instanceof VersionNotExistError) {
                this._serverStatus = ServerStatus.downloading;
                if (await this.downloadCheckstyle(error.version, uri)) {
                    result = await this.checkstyle(settings, URI.parse(uri).fsPath);
                }
            } else if (error instanceof InvalidVersionError) {
                this._connector.connection.sendNotification(VersionCheckNotification.notificationType, { uri, result: VersionCheckResult.invalid });
            } else {
                const errorMessage: string = getErrorMessage(error);
                this._connector.connection.sendNotification(ErrorNotification.notificationType, { uri, errorMessage });
            }
        } finally {
            if (result) {
                this._connector.connection.console.info(result);
                const diagnostics: Diagnostic[] = this.parseOutput(result);
                if (diagnostics.length === 0) {
                    this._connector.connection.sendNotification(CheckStatusNotification.notificationType, { uri, state: CheckStatus.success });
                } else {
                    this._connector.connection.sendNotification(CheckStatusNotification.notificationType, { uri, state: CheckStatus.fail });
                }
                this._connector.connection.sendDiagnostics({ uri, diagnostics });
            }
            this._serverStatus = ServerStatus.running;
        }
    }

    private async checkstyle(settings: ICheckStyleSettings, sourcePath: string): Promise<string> {
        const jarPath: string = await this.ensureJarFileParam(settings.version);
        const configPath: string = await this.ensureConfigurationFileParam(settings.configurationFile);
        const checkstyleParams: string[] = [
            '-jar',
            `"${jarPath}"`,
            '-c',
            `"${configPath}"`
        ];
        if (settings.propertiesPath) {
            checkstyleParams.push('-p', `"${settings.propertiesPath}"`);
        }
        checkstyleParams.push(`"${sourcePath}"`);
        return cpUtils.exec('java', checkstyleParams);
    }

    private async ensureJarFileParam(jar: string): Promise<string> {
        // test file path format
        if (await fse.pathExists(jar)) {
            return jar;
        }

        // test version format
        if (/^\d\.\d{1,2}(?:\.\d)?$/.test(jar)) {
            const jarPath: string = path.join(this._checkstyleResourcePath, `checkstyle-${jar}-all.jar`);
            if (await fse.pathExists(jarPath)) {
                return jarPath;
            }
            throw new VersionNotExistError(jar);
        }

        throw new InvalidVersionError();
    }

    private async ensureConfigurationFileParam(config: string): Promise<string> {
        switch (config.toLowerCase()) {
            case ConfigurationType.GoogleChecks:
            case ConfigurationType.SunChecks:
                return `/${config.toLowerCase()}.xml`;
            default:
                if (await fse.pathExists(config)) {
                    return config;
                } else {
                    throw new Error(`The configuration file ${config} does not exist`);
                }
        }
    }

    private async downloadCheckstyle(version: string, textDocumentUri: string): Promise<boolean> {
        const checkstyleJar: string = `checkstyle-${version}-all.jar`;
        const downloadLink: string = `https://github.com/checkstyle/checkstyle/releases/download/checkstyle-${version}/${checkstyleJar}`;
        const result: VersionCheckResult = await this.requestForVersion(downloadLink);
        this._connector.connection.sendNotification(VersionCheckNotification.notificationType, { uri: textDocumentUri, result });
        if (result !== VersionCheckResult.found) {
            return false;
        }

        const tempFileName: string = `${checkstyleJar}.download`;
        const tempFilePath: string = path.join(this._checkstyleResourcePath, tempFileName);
        if (await fse.pathExists(tempFilePath)) {
            await fse.remove(tempFilePath);
        }

        return await new Promise((resolve: (res: boolean) => void, _reject: (e: Error) => void): void => {
            this._connector.connection.sendNotification(DownloadStartNotification.notificationType, undefined);
            progress(request(downloadLink, { timeout: 20 * 1000 /*wait for 20 seconds*/ }))
                .on('progress', (state: any) => {
                    this._connector.connection.sendNotification(
                        DownloadStatusNotification.notificationType,
                        {
                            downloadStatus: DownloadStatus.downloading,
                            // tslint:disable-next-line:no-string-literal
                            percent: Math.round(state['percent'] * 100)
                        }
                    );
                })
                .on('error', (err: any) => {
                    this._connector.connection.sendNotification(
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
                    await fse.rename(tempFilePath, path.join(this._checkstyleResourcePath, checkstyleJar));
                    this._connector.connection.sendNotification(
                        DownloadStatusNotification.notificationType,
                        {
                            downloadStatus: DownloadStatus.finished
                        }
                    );
                    resolve(true);
                }).pipe(fse.createWriteStream(tempFilePath));
        });
    }

    private async requestForVersion(url: string): Promise<VersionCheckResult> {
        return await new Promise((resolve: (ret: VersionCheckResult) => void): void => {
            request(
                {
                    method: 'GET',
                    uri: url,
                    followRedirect: false,
                    timeout: 10 * 1000 /*wait for 10 seconds*/
                },
                (_error: any, response: request.RequestResponse, _body: any): void => {
                    if (!response || _error) {
                        resolve(VersionCheckResult.exception);
                    } else {
                        if (response.statusCode === 302) {
                            resolve(VersionCheckResult.found);
                        } else {
                            resolve(VersionCheckResult.invalid);
                        }
                    }
                });
        });
    }

    private parseOutput(output: string): Diagnostic[] {
        const regex: RegExp = /^(?:\[[A-Z]*?\] )?(.*\.java):(\d+)(?::([\w \-]+))?: (warning:|)(.+)/;
        const lines: string[] = output.split(/\r?\n/);
        const diagnostics: Diagnostic[] = [];
        for (const line of lines) {
            const match: string[] = line.match(regex);
            if (match) {
                const [rowNum, , , message] = match.slice(2, 6);
                let row: number = Number(rowNum);
                row = row - 1 < 0 ? 0 : row - 1;
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: { line: row, character: 0 },
                        end: { line: row, character: Number.MAX_VALUE }
                    },
                    message: message,
                    source: 'Checkstyle'
                });
            }
        }
        return diagnostics;
    }
}
