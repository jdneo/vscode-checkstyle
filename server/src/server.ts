'use strict';

import { pathExists } from 'fs-extra';
import * as path from 'path';
import {
    ClientCapabilities,
    createConnection,
    Diagnostic,
    DiagnosticSeverity,
    DidChangeConfigurationParams,
    InitializeParams,
    Proposed,
    ProposedFeatures,
    RequestType,
    TextDocument,
    TextDocumentChangeEvent,
    TextDocumentIdentifier,
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

interface ICheckstyleParams {
    readonly textDocument: TextDocumentIdentifier;
}

namespace CheckStyleRequest {
    // tslint:disable-next-line:export-name
    export const requestType: RequestType<ICheckstyleParams, void, void, void> = new RequestType<ICheckstyleParams, void, void, void>('textDocument/checkstyle');
}
connection.onRequest(CheckStyleRequest.requestType, (params: ICheckstyleParams) => checkstyle(params.textDocument.uri, true));
connection.listen();

interface ICheckStyleSettings {
    autocheck: boolean;
    jarPath: string;
    configurationFile: string;
    propertiesPath: string;
}

enum ConfigurationType {
    GoogleChecks = 'google_checks',
    SunChecks = 'sun_checks'
}

const defaultSettings: ICheckStyleSettings = {
    autocheck: true,
    jarPath: path.join(__dirname, '..', 'resources', 'checkstyle-8.0-all.jar'),
    configurationFile: ConfigurationType.GoogleChecks,
    propertiesPath: undefined
};
let globalSettings: ICheckStyleSettings = defaultSettings;

const documentSettings: Map<string, Thenable<ICheckStyleSettings>> = new Map();

connection.onDidChangeConfiguration((change: DidChangeConfigurationParams) => {
    if (hasConfigurationCapability) {
        documentSettings.clear();
    } else {
        globalSettings = <ICheckStyleSettings>(change.settings.checkstyle || defaultSettings);
    }
    documents.all().forEach((doc: TextDocument) => checkstyle(doc.uri));
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

async function ensureConfigurationFileParam(config: string): Promise<string> {
    switch (config.toLowerCase()) {
        case ConfigurationType.GoogleChecks:
        case ConfigurationType.SunChecks:
            return `/${config.toLowerCase()}.xml`;
        default:
            if (await pathExists(config)) {
                return config;
            } else {
                throw new Error(`The configuration file ${config} does not exist`);
            }
    }
}

documents.onDidClose((event: TextDocumentChangeEvent) => documentSettings.delete(event.document.uri));
documents.onDidOpen((event: TextDocumentChangeEvent) => checkstyle(event.document.uri));
documents.onDidSave((event: TextDocumentChangeEvent) => checkstyle(event.document.uri));
documents.listen(connection);

async function checkstyle(textDocumentUri: string, force?: boolean): Promise<void> {
    const settings: ICheckStyleSettings = await getDocumentSettings(textDocumentUri);
    if (!settings.autocheck && !force) {
        return;
    }

    const diagnostics: Diagnostic[] = [];
    try {
        const configPath: string = await ensureConfigurationFileParam(settings.configurationFile);
        const checkstyleParams: string[] = [
            '-jar',
            settings.jarPath,
            '-c',
            configPath,
            '-f',
            'xml'
        ];
        if (settings.propertiesPath) {
            checkstyleParams.push('-p', settings.propertiesPath);
        }
        checkstyleParams.push(URI.parse(textDocumentUri).fsPath);
        const result: string = await checker.exec(...checkstyleParams);
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
    }
    connection.sendDiagnostics({ uri: textDocumentUri, diagnostics });
}

function getErrorMessage(err: Error): string {
    let errorMessage: string = 'unknown error';
    if (typeof err.message === 'string') {
        errorMessage = <string>err.message;
    }
    return `Checkstyle Error: - '${errorMessage}'`;
}
