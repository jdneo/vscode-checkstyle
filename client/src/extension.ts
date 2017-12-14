'use strict';

import { pathExists } from 'fs-extra';
import * as path from 'path';
import {
    commands,
    Disposable,
    ExtensionContext,
    OutputChannel,
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
    setCheckstyleJar,
    setCheckstyleProperties
} from './command/userSettings';
import { downloadCheckstyle } from './utils/downloadCheckstyle';

interface ICheckStyleSettings {
    autocheck: boolean;
    jarPath: string;
    configurationFile: string;
    propertiesPath: string;
}

let client: LanguageClient;

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
                autocheck: config.get<boolean>('autocheck'),
                jarPath: config.get<string>('jarPath') || path.join(__dirname, '..', '..', 'resources', 'checkstyle-8.0-all.jar'),
                configurationFile: config.get<string>('configurationFile'),
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
    const outputChannel: OutputChannel = window.createOutputChannel('Checkstyle');
    await ensureDefaultJarInstalled(outputChannel, context.extensionPath);
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
    client.onReady().then(() => {
        Configuration.initialize();
    });

    initCommand(context, outputChannel, 'checkstyle.checkCodeWithCheckstyle', () => checkCodeWithCheckstyle(client));
    initCommand(context, outputChannel, 'checkstyle.setJarPath', setCheckstyleJar);
    initCommand(context, outputChannel, 'checkstyle.setConfigurationFile', setCheckstyleConfig);
    initCommand(context, outputChannel, 'checkstyle.setPropertyFile', setCheckstyleProperties);
    initCommand(context, outputChannel, 'checkstyle.setAutocheck', setAutoCheckStatus);

    context.subscriptions.push(
        client.start()
    );
}

async function ensureDefaultJarInstalled(outputChannel: OutputChannel, extensionPath: string, version: string = '8.0'): Promise<void> {
    if (!(await pathExists(path.join(extensionPath, 'resources', `checkstyle-${version}-all.jar`)))) {
        outputChannel.show();
        outputChannel.appendLine('Cannot find Checkstyle, start to download...');
        await downloadCheckstyle(outputChannel, path.join(extensionPath, 'resources'), version);
    }
}

export function deactivate(): Thenable<void> {
    if (!client) {
        return undefined;
    }
    Configuration.dispose();
    return client.stop();
}

function initCommand(context: ExtensionContext, outputChannel: OutputChannel, commandId: string, callback: (...args: any[]) => any): void {
    context.subscriptions.push(commands.registerCommand(commandId, async(...args: any[]) => {
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

function getErrorMessage(err: Error): string {
    let errorMessage: string = 'unknown error';
    if (typeof err.message === 'string') {
        errorMessage = <string>err.message;
    }
    return `Checkstyle Error: - '${errorMessage}'`;
}
