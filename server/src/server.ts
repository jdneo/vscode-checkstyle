'use strict';

import {
    ClientCapabilities,
    createConnection,
    Diagnostic,
    DidChangeConfigurationParams,
    InitializeParams,
    Proposed,
    ProposedFeatures,
    TextDocument,
    TextDocumentChangeEvent,
    TextDocuments
} from 'vscode-languageserver';
import URI from 'vscode-uri';
import { checker } from './checker';
import {
    CheckStyleRequest,
    ICheckstyleParams
} from './CheckStyleRequest';
import { DEFAULT_SETTINGS, ICheckStyleSettings } from './checkstyleSetting';
import { downloadCheckstyle } from './downloadCheckstyle';
import { InvalidVersionError, VersionNotExistError } from './errors';
import {
    CheckStatus,
    CheckStatusNotification,
    ErrorNotification,
    ServerStatus,
    ServerStatusNotification,
    VersionInvalidNotification
} from './notifications';
import { parser } from './parser';

const connection: any = createConnection(ProposedFeatures.all);
const documents: TextDocuments = new TextDocuments();
const documentSettings: Map<string, Thenable<ICheckStyleSettings>> = new Map();
let status: ServerStatus = ServerStatus.Stopped;
let hasConfigurationCapability: boolean = false;
let globalSettings: ICheckStyleSettings = DEFAULT_SETTINGS;

connection.onInitialize((params: InitializeParams) => {
    const capabilities: ClientCapabilities = params.capabilities;

    hasConfigurationCapability = (<Proposed.ConfigurationClientCapabilities>capabilities).workspace && !!(<Proposed.ConfigurationClientCapabilities>capabilities).workspace.configuration;

    return {
        capabilities: {
            textDocumentSync: documents.syncKind
        }
    };
});

connection.onInitialized(() => updateServerStatus(ServerStatus.Running));

connection.onRequest(CheckStyleRequest.requestType, (params: ICheckstyleParams) => checkstyle(params.textDocument.uri, true));

connection.onDidChangeConfiguration((change: DidChangeConfigurationParams) => {
    if (hasConfigurationCapability) {
        documentSettings.clear();
    } else {
        globalSettings = <ICheckStyleSettings>(change.settings.checkstyle || DEFAULT_SETTINGS);
    }
    documents.all().forEach((doc: TextDocument) => checkstyle(doc.uri));
});

connection.listen();

documents.onDidClose((event: TextDocumentChangeEvent) => documentSettings.delete(event.document.uri));
documents.onDidOpen((event: TextDocumentChangeEvent) => checkstyle(event.document.uri));
documents.onDidSave((event: TextDocumentChangeEvent) => checkstyle(event.document.uri));
documents.listen(connection);

function getDocumentSettings(resource: string): Thenable<ICheckStyleSettings> {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result: Thenable<ICheckStyleSettings> = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({ scopeUri: resource });
        documentSettings.set(resource, result);
    }
    return result;
}

async function checkstyle(textDocumentUri: string, force?: boolean): Promise<void> {
    if (status !== ServerStatus.Running) {
        return;
    }
    const settings: ICheckStyleSettings = await getDocumentSettings(textDocumentUri);
    let result: string;
    try {
        result = await checker.checkstyle(settings, URI.parse(textDocumentUri).fsPath, force);
    } catch (error) {
        if (error instanceof VersionNotExistError) {
            updateServerStatus(ServerStatus.Downloading);
            if (await downloadCheckstyle(connection, checker.resourcesPath, error.version, textDocumentUri)) {
                result = await checker.checkstyle(settings, URI.parse(textDocumentUri).fsPath, force);
            }
        } else if (error instanceof InvalidVersionError) {
            connection.sendNotification(VersionInvalidNotification.notificationType, { uri: textDocumentUri });
        } else {
            const errorMessage: string = getErrorMessage(error);
            connection.sendNotification(ErrorNotification.notificationType, {uri: textDocumentUri, errorMessage});
        }
    } finally {
        if (result) {
            connection.console.info(result);
            const diagnostics: Diagnostic[] = parser.parseOutput(result);
            if (diagnostics.length === 0) {
                connection.sendNotification(CheckStatusNotification.notificationType, { uri: textDocumentUri, state: CheckStatus.success });
            } else {
                connection.sendNotification(CheckStatusNotification.notificationType, { uri: textDocumentUri, state: CheckStatus.fail });
            }
            connection.sendDiagnostics({ uri: textDocumentUri, diagnostics });
        }
        updateServerStatus(ServerStatus.Running);
    }
}

function updateServerStatus(newStatus: ServerStatus): void {
    if (status !== newStatus) {
        status = newStatus;
        connection.sendNotification(ServerStatusNotification.notificationType, { status: status });
    }
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
