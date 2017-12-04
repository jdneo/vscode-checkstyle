'use strict';

import * as path from 'path';
import {
    commands,
    Disposable,
    ExtensionContext,
    TextEditor,
    window,
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
    RequestType,
    ServerOptions,
    TextDocumentIdentifier,
    TransportKind
} from 'vscode-languageclient';

interface ICheckStyleSettings {
    enable: boolean;
    jarPath: string;
    configPath: string;
    propertiesPath: string;
}

interface ICheckstyleParams {
    readonly textDocument: TextDocumentIdentifier;
}

namespace CheckStyleRequest {
    export const requestType: RequestType<ICheckstyleParams, void, void, void> = new RequestType<ICheckstyleParams, void, void, void>('textDocument/checkstyle');
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
                enable: config.get<boolean>('enable'),
                jarPath: config.get<string>('jarPath') || path.join(__dirname, '..', '..', 'resources', 'checkstyle-8.4.jar'),
                configPath: config.get<string>('configPath') || path.join(__dirname, '..', '..', 'resources', 'google_checks.xml'),
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
    });

    function checkCodeWithCheckstyle(): void {
        const textEditor: TextEditor = window.activeTextEditor;
        if (!textEditor) {
            return;
        }
        const uri: string = textEditor.document.uri.toString();
        client.sendRequest(CheckStyleRequest.requestType, { textDocument: { uri } });
    }

    context.subscriptions.push(
        client.start(),
        commands.registerCommand('checkstyle.checkCodeWithCheckstyle', checkCodeWithCheckstyle)
    );
}

export function deactivate(): Thenable<void> {
    if (!client) {
        return undefined;
    }
    Configuration.dispose();
    return client.stop();
}
