'use strict';

import * as path from 'path';
import {
    ClientCapabilities,
    createConnection,
    Diagnostic,
    DiagnosticSeverity,
    DidChangeConfigurationParams,
    InitializeParams,
    MessageType,
    Proposed,
    ProposedFeatures,
    ShowMessageNotification,
    TextDocument,
    TextDocumentChangeEvent,
    TextDocuments
} from 'vscode-languageserver';
import URI from 'vscode-uri';
import { checker } from './checker';
import { IDiagnosticProblem, parseOutput } from './parser';

// tslint:disable-next-line:typedef
const connection = createConnection(ProposedFeatures.all);

const documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
    const capabilities: ClientCapabilities = params.capabilities;

    hasWorkspaceFolderCapability = (<Proposed.WorkspaceFoldersClientCapabilities>capabilities).workspace && !!(<Proposed.WorkspaceFoldersClientCapabilities>capabilities).workspace.workspaceFolders;
    hasConfigurationCapability = (<Proposed.ConfigurationClientCapabilities>capabilities).workspace && !!(<Proposed.ConfigurationClientCapabilities>capabilities).workspace.configuration;

    return {
        capabilities: {
            textDocumentSync: documents.syncKind
        }
    };
});

connection.onInitialized(() => {
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(() => {
            connection.console.log('Workspace folder change event received');
        });
    }
});

interface ICheckStyleSettings {
    jarPath: string;
    configPath: string;
}

const defaultSettings: ICheckStyleSettings = {
    jarPath: path.join(__dirname, '..', 'resources', 'checkstyle-8.4.jar'),
    configPath: path.join(__dirname, '..', 'resources', 'google_checks.xml')
};
let globalSettings: ICheckStyleSettings = defaultSettings;

const documentSettings: Map<string, Thenable<ICheckStyleSettings>> = new Map();

connection.onDidChangeConfiguration((change: DidChangeConfigurationParams) => {
    if (hasConfigurationCapability) {
        documentSettings.clear();
    } else {
        globalSettings = <ICheckStyleSettings>(change.settings.checkstyle || defaultSettings);
    }
    documents.all().forEach(checkstyle);
});

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

documents.onDidClose((event: TextDocumentChangeEvent) => documentSettings.delete(event.document.uri));

documents.onDidOpen((event: TextDocumentChangeEvent) => checkstyle(event.document));
documents.onDidSave((event: TextDocumentChangeEvent) => checkstyle(event.document));

async function checkstyle(textDocument: TextDocument): Promise<void> {
    const diagnostics: Diagnostic[] = [];
    try {
        const settings: ICheckStyleSettings = await getDocumentSettings(textDocument.uri);
        const result: string = await checker.exec(
            '-jar',
            settings.jarPath,
            '-c',
            settings.configPath,
            '-f',
            'xml',
            URI.parse(textDocument.uri).fsPath
        );
        const checkProblems: IDiagnosticProblem[] = await parseOutput(result);
        for (const problem of checkProblems) {
            diagnostics.push({
                severity: problem.problemType === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
                range: {
                    start: { line: problem.lineNum - 1, character: problem.colNum },
                    end: { line: problem.lineNum - 1, character: Number.MAX_VALUE }
                },
                message: problem.message,
                source: 'Checkstyle'
            });
        }
    } catch (error) {
        const errorMessage: string = getErrorMessage(error);
        connection.console.error(errorMessage);
        connection.sendNotification(ShowMessageNotification.type, {type: MessageType.Error, message: errorMessage});
    }
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.listen(connection);

connection.listen();

function getErrorMessage(err: Error): string {
    let errorMessage: string = 'unknown error';
    if (typeof err.message === 'string') {
        errorMessage = <string>err.message;
    }
    return `Checkstyle Error: - '${errorMessage}'`;
}
