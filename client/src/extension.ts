'use strict';

import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import {
    commands,
    Disposable,
    ExtensionContext,
    MessageItem,
    OutputChannel,
    Progress,
    ProgressLocation,
    Uri,
    window,
    workspace,
    WorkspaceConfiguration
} from 'vscode';
import { UserCancelledError } from 'vscode-azureextensionui';
import {
    CancellationToken,
    DidChangeConfigurationNotification,
    LanguageClient,
    LanguageClientOptions,
    Middleware,
    Proposed,
    ProposedFeatures,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient';
import { checkCodeWithCheckstyle } from './command/checkCodeWithCheckstyle';
import {
    setAutoCheckStatus,
    setCheckstyleConfig,
    setCheckstyleProperties,
    setCheckstyleVersion
} from './command/userSettings';
import { DialogResponses } from './DialogResponses';
import { ICheckStyleSettings } from './ICheckStyleSettings';
import { IStatusParams, StatusNotification } from './notifications';
import {
    DownloadStartRequest,
    DownloadStatus,
    DownloadStatusRequest,
    IDownloadParams,
    IUpdateSettingParams,
    UpdateSettingParamsRequest
} from './requests';
import { StatusController } from './StatusController';

let client: LanguageClient;
let statusController: StatusController;

namespace Configuration {

    let configurationListener: Disposable;

    export function computeConfiguration(params: Proposed.ConfigurationParams, _token: CancellationToken, _next: Function): {}[] {
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

const resourcesPath: string = path.join(os.homedir(), '.vscode-checkstyle', 'resources');
export async function activate(context: ExtensionContext): Promise<void> {
    await fse.ensureDir(resourcesPath);
    const outputChannel: OutputChannel = window.createOutputChannel('Checkstyle');
    statusController = new StatusController();

    initializeClient(context);

    client.onReady().then(() => {
        Configuration.initialize();
        registerClientListener();
    });

    window.onDidChangeActiveTextEditor(statusController.updateStatusBar, statusController);
    workspace.onDidCloseTextDocument(statusController.onDidCloseTextDocument, statusController);
    workspace.onDidChangeTextDocument(statusController.onDidChangeTextDocument, statusController);

    initCommand(context, outputChannel, 'checkstyle.checkCodeWithCheckstyle', () => checkCodeWithCheckstyle(client));
    initCommand(context, outputChannel, 'checkstyle.setVersion', (uri?: Uri) => setCheckstyleVersion(resourcesPath, uri));
    initCommand(context, outputChannel, 'checkstyle.setConfigurationFile', setCheckstyleConfig);
    initCommand(context, outputChannel, 'checkstyle.setPropertyFile', setCheckstyleProperties);
    initCommand(context, outputChannel, 'checkstyle.setAutocheck', setAutoCheckStatus);

    context.subscriptions.push(
        client.start()
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

function initCommand(context: ExtensionContext, outputChannel: OutputChannel, commandId: string, callback: (...args: any[]) => any): void {
    context.subscriptions.push(commands.registerCommand(commandId, async (...args: any[]) => {
        try {
            await callback(...args);
        } catch (error) {
            if (error instanceof UserCancelledError) {
                // do nothing here
            } else {
                const errMsg: string = getErrorMessage(error);
                outputChannel.appendLine(errMsg);
                window.showErrorMessage(errMsg);
            }
        }
    }));
}

function initializeClient(context: ExtensionContext): void {
    const serverModule: string = context.asAbsolutePath(path.join('server', 'server.js'));
    const debugOptions: {} = { execArgv: ['--nolazy', '--inspect=6009'] };

    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    const middleware: ProposedFeatures.ConfigurationMiddleware | Middleware = {
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
    client.onDidChangeState(statusController.onDidChangeState, statusController);
}

function registerClientListener(): void {
    client.onRequest(DownloadStartRequest.requestType, () => {
        window.withProgress({ location: ProgressLocation.Window }, async (p: Progress<{}>) => {
            return new Promise((resolve: () => void, reject: (e: Error) => void): void => {
                p.report({ message: 'Fetching the download link...' });
                client.onRequest(DownloadStatusRequest.requestType, (param: IDownloadParams) => {
                    switch (param.downloadStatus) {
                        case DownloadStatus.downloading:
                            p.report({ message: `Downloading checkstyle... ${param.percent}%` });
                            break;
                        case DownloadStatus.finished:
                            resolve();
                            break;
                        case DownloadStatus.error:
                            reject(param.error);
                            break;
                        default:
                            break;
                    }
                });
            });
        });
    });

    client.onRequest(UpdateSettingParamsRequest.requestType, async (param: IUpdateSettingParams) => {
        const message: string = 'The Checkstyle version setting is invalid. Update it?';
        const result: MessageItem | undefined = await window.showWarningMessage(message, DialogResponses.yes, DialogResponses.cancel);
        if (result === DialogResponses.yes) {
            commands.executeCommand('checkstyle.setVersion', client.protocol2CodeConverter.asUri(param.uri));
        }
    });

    client.onNotification(StatusNotification.notificationType, (params: IStatusParams) => {
        statusController.updateStatusBar(window.activeTextEditor, params);
    });
}

function getErrorMessage(err: Error): string {
    let errorMessage: string = 'unknown error';
    if (typeof err.message === 'string') {
        errorMessage = <string>err.message;
    }
    return `Checkstyle Error: - '${errorMessage}'`;
}
