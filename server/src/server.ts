/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
	IPCMessageReader, IPCMessageWriter, createConnection, IConnection, TextDocuments, TextDocument,InitializeResult, Diagnostic, DiagnosticSeverity
} from 'vscode-languageserver';
import Uri from 'vscode-uri'
import { checkStyleCli } from './checkStyleCli';
import { parseOutput, CheckProblem } from './utils/parser';

let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

let documents: TextDocuments = new TextDocuments();
documents.listen(connection);

connection.onInitialize((): InitializeResult => {
	return {
		capabilities: {
			textDocumentSync: documents.syncKind,
			completionProvider: {
				resolveProvider: true
			}
		}
	}
});

documents.onDidChangeContent((change) => {
	validateTextDocument(change.document);
});

interface Settings {
	lspSample: ExampleSettings;
}

interface ExampleSettings {
	maxNumberOfProblems: number;
}

let maxNumberOfProblems: number = 100;
connection.onDidChangeConfiguration((change) => {
	let settings = <Settings>change.settings;
	maxNumberOfProblems = settings.lspSample.maxNumberOfProblems || 100;
	documents.all().forEach(validateTextDocument);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	const result: string = await checkStyle(Uri.parse(textDocument.uri).fsPath);
	const checkProblems: CheckProblem[] = await parseOutput(result);
	let diagnostics: Diagnostic[] = [];
	let problems = 0;
	for (let i = 0; i < checkProblems.length && problems < maxNumberOfProblems; i++) {
		diagnostics.push({
			severity: checkProblems[i].type === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
			range: {
				start: { line: checkProblems[i].lineNum - 1, character: checkProblems[i].colNum },
				end: { line: checkProblems[i].lineNum - 1, character: Number.MAX_VALUE }
			},
			message: checkProblems[i].message,
			source: 'checkstyle'
		});
		problems++;
	}
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

async function checkStyle(sourceFile: string): Promise<string> {
	const result: string = await checkStyleCli.exec(
		'-jar', 
		'D:\\Tools\\checkstyle\\checkstyle-8.0-all.jar', 
		'-c', 
		'D:\\work\\java_tooling\\repo\\azure-tools-for-java\\Utils\\check-tools\\src\\main\\resources\\checkstyle.xml',
		'-f',
		'xml',
		sourceFile
	);
	return result;
}

connection.listen();
