// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as _ from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';
import { checkstyleChannel } from './checkstyleChannel';
import { checkstyleDiagnosticCollector } from './checkstyleDiagnosticCollector';
import { checkstyleStatusBar } from './checkstyleStatusBar';
import { executeJavaLanguageServerCommand } from './commands/executeJavaLanguageServerCommand';
import { CheckstyleExtensionCommands } from './constants/commands';
import { FileSynchronizer, SyncedFile } from './features/FileSynchronizer';
import { ICheckstyleResult } from './models';
import { handleErrors } from './utils/errorUtils';
import { getCheckstyleConfigurationPath, getCheckstyleProperties } from './utils/settingUtils';

class CheckstyleDiagnosticManager implements vscode.Disposable {

    private context: vscode.ExtensionContext;
    private listeners: vscode.Disposable[];
    private pendingDiagnostics: Set<SyncedFile | vscode.Uri>;
    private syncedFiles: Map<string, SyncedFile>;
    private synchronizer: FileSynchronizer;
    private diagnosticDelayTrigger: (() => Promise<void>) & _.Cancelable;

    public initialize(context: vscode.ExtensionContext): void {
        this.context = context;
        this.listeners = [];
        this.pendingDiagnostics = new Set();
        this.syncedFiles = new Map();
        this.synchronizer = new FileSynchronizer(this.context);
        this.diagnosticDelayTrigger = _.debounce(this.sendPendingDiagnostics.bind(this), 200);
        vscode.workspace.onDidOpenTextDocument(this.onDidOpenTextDocument, this, this.listeners);
        vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument, this, this.listeners);
        vscode.workspace.onDidCloseTextDocument(this.onDidCloseTextDocument, this, this.listeners);
        vscode.workspace.textDocuments.forEach(this.onDidOpenTextDocument, this);
    }

    public dispose(): void {
        this.synchronizer.dispose();
        for (const listener of this.listeners) {
            listener.dispose();
        }
    }

    public getDiagnostics(uris: vscode.Uri[]): void {
        for (const uri of uris) {
            if (uri.scheme === 'file' && path.extname(uri.fsPath).toLowerCase() === '.java') {
                this.pendingDiagnostics.add(this.syncedFiles.get(uri.fsPath) || uri);
            }
        }
        this.diagnosticDelayTrigger();
    }

    private onDidOpenTextDocument(document: vscode.TextDocument): void {
        if (!(document.languageId === 'java' && document.uri.scheme === 'file')) {
            return;
        }

        const filePath: string = document.uri.fsPath;
        if (this.syncedFiles.has(filePath)) {
            return;
        }

        const syncedFile: SyncedFile = new SyncedFile(document, this.synchronizer);
        this.syncedFiles.set(filePath, syncedFile);
        syncedFile.open();
        this.requestDiagnostic(syncedFile);
    }

    private onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent): void {
        const filePath: string = e.document.uri.fsPath;
        const syncedFile: SyncedFile | undefined = this.syncedFiles.get(filePath);
        if (!syncedFile) {
            return;
        }
        syncedFile.onContentChanged(e);
        this.requestDiagnostic(syncedFile);
    }

    private onDidCloseTextDocument(document: vscode.TextDocument): void {
        const filePath: string = document.uri.fsPath;
        const syncedFile: SyncedFile | undefined = this.syncedFiles.get(filePath);
        if (!syncedFile) {
            return;
        }
        this.syncedFiles.delete(filePath);
        syncedFile.close();
    }

    private requestDiagnostic(file: SyncedFile): void {
        this.pendingDiagnostics.add(file);
        this.diagnosticDelayTrigger();
    }

    private async sendPendingDiagnostics(): Promise<void> {
        await this.synchronizer.flush();

        const fileCheckMap: Map<string, vscode.Uri> = new Map(); // Check path -> real uri
        for (const file of this.pendingDiagnostics.values()) {
            if (file instanceof SyncedFile) {
                fileCheckMap.set(file.syncUri.fsPath, file.realUri);
            } else {
                fileCheckMap.set(file.fsPath, file);
            }
        }

        const configurationPath: string = getCheckstyleConfigurationPath();
        if (configurationPath === '') {
            checkstyleChannel.appendLine('Checkstyle configuration file not set yet, skip the check.');
            return;
        }

        fileCheckMap.forEach((uri: vscode.Uri) => checkstyleDiagnosticCollector.delete(uri));

        try {
            const results: { [file: string]: ICheckstyleResult[] } | undefined = await executeJavaLanguageServerCommand<{ [file: string]: ICheckstyleResult[] }>(
                CheckstyleExtensionCommands.CHECK_CODE_WITH_CHECKSTYLE, [...fileCheckMap.keys()], configurationPath, getCheckstyleProperties(),
            );
            if (!results) {
                checkstyleChannel.appendLine('Unable to get results from Language Server.');
                return;
            }
            for (const [checkFile, diagnostics] of Object.entries(results)) {
                const diagnosticUri: vscode.Uri | undefined = fileCheckMap.get(checkFile);
                if (!diagnosticUri) {
                    checkstyleChannel.appendLine(`Unable to map check file ${checkFile} back to real uri.`);
                    continue;
                }
                checkstyleDiagnosticCollector.addDiagnostics(diagnosticUri, diagnostics);
            }
            checkstyleStatusBar.showStatus();
        } catch (error) {
            handleErrors(error);
        } finally {
            this.pendingDiagnostics.clear();
        }
    }
}

export const checkstyleDiagnosticManager: CheckstyleDiagnosticManager = new CheckstyleDiagnosticManager();
