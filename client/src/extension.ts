'use strict';

import * as path from 'path';

import {
    Disposable,
    ExtensionContext,
    window,
    workspace,
    WorkspaceConfiguration
} from 'vscode';
import {
    CancellationToken,
    DidChangeConfigurationNotification,
    LanguageClient,
    LanguageClientOptions,
    MessageType,
    Middleware,
    Proposed,
    ProposedFeatures,
    ServerOptions,
    ShowMessageNotification,
    ShowMessageParams,
    TransportKind
} from 'vscode-languageclient';

interface ICheckStyleSettings {
    jarPath: string;
    configPath: string;
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
                jarPath: config.get<string>('jarPath') || path.join(__dirname, '..', '..', 'resources', 'checkstyle-8.4.jar'),
                configPath: config.get<string>('configPath') || path.join(__dirname, '..', '..', 'resources', 'google_checks.xml')
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

export function activate(context: ExtensionContext): void {
    const serverModule: string = context.asAbsolutePath(path.join('server', 'server.js'));
    const debugOptions: {} = { execArgv: ['--nolazy', '--inspect=6009'] };

    const serverOptions: ServerOptions = {
        run : { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    const middleware: ProposedFeatures.ConfigurationMiddleware | Middleware = {
        workspace: {
            configuration: Configuration.computeConfiguration
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{scheme: 'file', language: 'java'}],
        middleware: <Middleware>middleware
    };

    client = new LanguageClient('checkstyle', 'Checkstyle', serverOptions, clientOptions);
    client.registerProposedFeatures();
    client.onReady().then(() => {
        Configuration.initialize();
        client.onNotification(ShowMessageNotification.type, (param: ShowMessageParams) => {
            switch (param.type) {
                case MessageType.Error:
                    window.showErrorMessage(param.message);
                    break;
                case MessageType.Warning:
                    window.showWarningMessage(param.message);
                    break;
                default:
                    window.showInformationMessage(param.message);
            }
        });
    });

    client.start();
}

export function deactivate(): Thenable<void> {
    if (!client) {
        return undefined;
    }
    Configuration.dispose();
    return client.stop();
}
