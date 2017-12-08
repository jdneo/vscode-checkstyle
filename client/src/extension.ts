'use strict';

import * as path from 'path';
import {
    commands,
    Disposable,
    ExtensionContext,
    workspace,
    WorkspaceConfiguration
} from 'vscode';
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
import { setCheckstyleConfig, setCheckstyleJar } from './command/userSettings';

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
                jarPath: config.get<string>('jarPath') || path.join(__dirname, '..', '..', 'resources', 'checkstyle-8.5-all.jar'),
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

export function activate(context: ExtensionContext): void {
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

    context.subscriptions.push(
        client.start(),
        commands.registerCommand('checkstyle.checkCodeWithCheckstyle', () => checkCodeWithCheckstyle(client)),
        commands.registerCommand('checkstyle.setJarPath', setCheckstyleJar),
        commands.registerCommand('checkstyle.setConfigurationFile', setCheckstyleConfig)
    );
}

export function deactivate(): Thenable<void> {
    if (!client) {
        return undefined;
    }
    Configuration.dispose();
    return client.stop();
}
