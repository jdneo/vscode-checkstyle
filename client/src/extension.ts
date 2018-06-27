'use strict';

import * as fse from 'fs-extra';
// tslint:disable-next-line:no-require-imports
import opn = require('opn');
import * as path from 'path';
import {
    commands,
    Disposable,
    ExtensionContext,
    MessageItem,
    Progress,
    ProgressLocation,
    Uri,
    window,
    workspace,
    WorkspaceConfiguration
} from 'vscode';
import { UserCancelledError } from 'vscode-azureextensionui';
import { TelemetryWrapper } from "vscode-extension-telemetry-wrapper";
import {
    CancellationToken,
    ConfigurationParams,
    DidChangeConfigurationNotification,
    LanguageClient,
    LanguageClientOptions,
    Middleware,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient';
import { extensionGlobalPath, ICheckStyleSettings } from './checkStyleSetting';
import { checkCodeWithCheckstyle } from './command/checkCodeWithCheckstyle';
import { clearCheckstyleViolation } from './command/clearCheckstyleViolation';
import { setAutoCheckStatus } from './command/setAutoCheckStatus';
import { setCheckstyleConfig } from './command/setCheckstyleConfig';
import { setCheckstyleProperties } from './command/setCheckstyleProperties';
import { setCheckstyleVersion } from './command/setCheckstyleVersion';
import { DialogResponses } from './DialogResponses';
import {
    CheckStatus,
    CheckStatusNotification,
    DownloadStartNotification,
    DownloadStatus,
    DownloadStatusNotification,
    ErrorNotification,
    ICheckStatusParams,
    IDownloadParams,
    IErrorParams,
    IServerStatusParams,
    IVersionCheckParams,
    ServerStatusNotification,
    VersionCheckNotification,
    VersionCheckResult
} from './notifications';
import { StatusController } from './StatusController';

let client: LanguageClient;
let statusController: StatusController;

namespace Configuration {

    let configurationListener: Disposable;

    export function computeConfiguration(params: ConfigurationParams, _token: CancellationToken, _next: Function): {}[] {
        if (!params.items) {
            return null;
        }
        const result: (ICheckStyleSettings | null)[] = [];
        for (const item of params.items) {
            if (item.section) {
                result.push(null);
                continue;
            }
            let config: WorkspaceConfiguration;
            if (item.scopeUri) {
                config = workspace.getConfiguration('checkstyle', client.protocol2CodeConverter.asUri(item.scopeUri));
            } else {
                config = workspace.getConfiguration('checkstyle');
            }
            result.push({
                autocheck: config.get<boolean>('autocheck', false),
                version: config.get<string>('version', '8.0'),
                configurationFile: config.get<string>('configurationFile', 'google_checks'),
                propertiesPath: config.get<string>('propertiesPath')
            });
        }
        return result;
    }

    export function initialize(): void {
        configurationListener = workspace.onDidChangeConfiguration(() => {
            client.sendNotification(DidChangeConfigurationNotification.type, { settings: null });
        });
    }

    export function dispose(): void {
        if (configurationListener) {
            configurationListener.dispose();
        }
    }
}

export async function activate(context: ExtensionContext): Promise<void> {
    const resourcesPath: string = path.join(extensionGlobalPath, 'resources');
    await fse.ensureDir(resourcesPath);
    statusController = new StatusController();

    initializeClient(context);

    await TelemetryWrapper.initilizeFromJsonFile(context.asAbsolutePath('./package.json'));

    client.onReady().then(() => {
        Configuration.initialize();
        registerClientListener();
    });

    context.subscriptions.push(
        window.onDidChangeActiveTextEditor(() => statusController.updateStatusBar()),
        workspace.onDidCloseTextDocument(statusController.onDidCloseTextDocument, statusController),
        workspace.onDidChangeTextDocument(statusController.onDidChangeTextDocument, statusController),
        client.start(),
        TelemetryWrapper.registerCommand('checkstyle.checkCodeWithCheckstyle', () => wrapCallback((uri?: Uri) => checkCodeWithCheckstyle(client, uri))),
        TelemetryWrapper.registerCommand('checkstyle.cleanCheckstyleViolation', () => wrapCallback((uri?: Uri) => clearCheckstyleViolation(client, statusController, uri))),
        TelemetryWrapper.registerCommand('checkstyle.setVersion', () => wrapCallback((uri?: Uri) => setCheckstyleVersion(resourcesPath, uri))),
        TelemetryWrapper.registerCommand('checkstyle.setConfigurationFile', () => wrapCallback(() => setCheckstyleConfig(context))),
        TelemetryWrapper.registerCommand('checkstyle.setPropertyFile', () => wrapCallback(setCheckstyleProperties)),
        TelemetryWrapper.registerCommand('checkstyle.setAutocheck', () => wrapCallback(setAutoCheckStatus)),
        commands.registerCommand('checkstyle.showOutputChannel', () => { client.outputChannel.show(true); })
    );
}

export function deactivate(): Thenable<void> {
    if (!client) {
        return undefined;
    }
    Configuration.dispose();
    if (statusController) {
        statusController.dispose();
    }
    return client.stop();
}

function wrapCallback(callback: (...args: any[]) => any): (...args: any[]) => Promise<any> {
    return async (...args: any[]): Promise<any> => {
        try {
            await callback(...args);
        } catch (error) {
            if (error instanceof UserCancelledError) {
                // do nothing here
            } else {
                const errMsg: string = getErrorMessage(error);
                client.outputChannel.appendLine(errMsg);
                await window.showErrorMessage(errMsg);
            }
        }
    };
}

function initializeClient(context: ExtensionContext): void {
    const serverModule: string = context.asAbsolutePath(path.join('server', 'out', 'index.js'));
    const debugOptions: {} = { execArgv: ['--nolazy', '--inspect=6009'] };

    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    const middleware: Middleware = {
        workspace: {
            configuration: Configuration.computeConfiguration
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'java' }],
        middleware: <Middleware>middleware
    };

    client = new LanguageClient('checkstyle', 'Checkstyle', serverOptions, clientOptions);
    client.registerProposedFeatures();
}

function registerClientListener(): void {
    client.onNotification(DownloadStartNotification.notificationType, () => {
        window.withProgress({ location: ProgressLocation.Window }, async (p: Progress<{}>) => {
            return new Promise((resolve: () => void, reject: (e: Error) => void): void => {
                p.report({ message: 'Fetching the download link...' });
                client.onNotification(DownloadStatusNotification.notificationType, async (param: IDownloadParams) => {
                    switch (param.downloadStatus) {
                        case DownloadStatus.downloading:
                            p.report({ message: `Downloading checkstyle... ${param.percent}%` });
                            break;
                        case DownloadStatus.finished:
                            resolve();
                            break;
                        case DownloadStatus.error:
                            const choice: MessageItem = await window.showErrorMessage(getErrorMessage(param.error), DialogResponses.openDownloadPage);
                            if (choice === DialogResponses.openDownloadPage) {
                                opn(param.downloadLink || 'https://aka.ms/cs-download');
                            }
                            reject(param.error);
                            break;
                        default:
                            break;
                    }
                });
            });
        });
    });

    client.onNotification(VersionCheckNotification.notificationType, async (param: IVersionCheckParams) => {
        switch (param.result) {
            case VersionCheckResult.found:
                statusController.updateStatusBar({ uri: param.uri, state: CheckStatus.wait });
                break;
            case VersionCheckResult.invalid:
                statusController.updateStatusBar({ uri: param.uri, state: CheckStatus.exception });
                client.outputChannel.appendLine('Checkstyle version setting is invalid, please update it to a valid version number.');
                if (workspace.getConfiguration('checkstyle').get<boolean>('showCheckstyleVersionInvalid')) {
                    const message: string = 'The Checkstyle version setting is invalid. Would you like to update it?';
                    const result: MessageItem | undefined = await window.showWarningMessage(message, DialogResponses.yes, DialogResponses.never);
                    if (result === DialogResponses.yes) {
                        commands.executeCommand('checkstyle.setVersion', client.protocol2CodeConverter.asUri(param.uri));
                    } else if (result === DialogResponses.never) {
                        await workspace.getConfiguration('checkstyle').update('showCheckstyleVersionInvalid', false /* Value */, true /* User Setting */);
                    }
                }
                break;
            case VersionCheckResult.exception:
                statusController.updateStatusBar({ uri: param.uri, state: CheckStatus.exception });
                window.showErrorMessage('Failed to download the CheckStyle, please try again later.');
                break;
            default:
                break;
        }
    });

    client.onNotification(CheckStatusNotification.notificationType, (params: ICheckStatusParams) => {
        statusController.updateStatusBar(params);
    });

    client.onNotification(ServerStatusNotification.notificationType, (params: IServerStatusParams) => {
        statusController.onServerStatusDidChange(params.status);
    });

    client.onNotification(ErrorNotification.notificationType, (param: IErrorParams) => {
        statusController.updateStatusBar({ uri: param.uri, state: CheckStatus.exception });
        client.outputChannel.appendLine(param.errorMessage);
        TelemetryWrapper.report(TelemetryWrapper.EventType.ERROR, { properties: { errorMessage: param.errorMessage } });
    });
}

function getErrorMessage(err: Error): string {
    let errorMessage: string = 'unknown error';
    if (typeof err.message === 'string') {
        errorMessage = <string>err.message;
    } else {
        errorMessage = err.toString();
    }
    return `Checkstyle Error: - '${errorMessage}'`;
}
