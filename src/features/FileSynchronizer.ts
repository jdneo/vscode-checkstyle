// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as crypto from 'crypto';
import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

export class SyncedFile {

    private tempUri?: vscode.Uri;

    constructor(
        private readonly document: vscode.TextDocument,
        private readonly synchronizer: FileSynchronizer,
    ) { }

    public get realUri(): vscode.Uri {
        return this.document.uri;
    }

    public get syncUri(): vscode.Uri {
        return this.tempUri || this.realUri;
    }

    public open(): void {
        if (this.tempUri) {
            return; // Already opened
        }
        if (this.document.isDirty) {
            this.tempUri = this.synchronizer.open(this.document);
            this.synchronizer.change(this.document);
        } else {
            // Delay the temp file creation until changing it
        }
    }

    public close(): void {
        this.tempUri = undefined;
        this.synchronizer.close(this.document);
    }

    public async onContentChanged(e: vscode.TextDocumentChangeEvent): Promise<void> {
        if (!this.tempUri) { // Lazy loading temp file
            this.tempUri = this.synchronizer.open(this.document);
        }
        this.synchronizer.change(e.document, e.contentChanges);
    }
}

interface ISyncRequests {
    open: Map<string, string>; // Real file -> temp file
    change: Map<string, string>; // Temp file -> new content
    close: Map<string, string>; // Real file -> temp file
}

// tslint:disable-next-line: max-classes-per-file
export class FileSynchronizer implements vscode.Disposable {

    private tempStorage: string = this.getTempStorage();
    private tempFilePool: Map<string, string> = new Map(); // managed filePath -> tempPath
    private pending: ISyncRequests = { open: new Map(), change: new Map(), close: new Map() };
    private pendingPromises: Map<string, Promise<void>> = new Map();

    constructor(private context: vscode.ExtensionContext) {}

    public dispose(): void {
        fse.remove(this.tempStorage);
    }

    // Ensure a file created in temp folder and managed by synchronizer
    public open(document: vscode.TextDocument): vscode.Uri {
        const tempPath: string = this.getTempPath(document);
        if (!this.tempFilePool.has(document.uri.fsPath)) {
            this.pending.open.set(document.uri.fsPath, tempPath);
        } // Skip if already open
        return vscode.Uri.file(tempPath);
    }

    // Change content of temp file that already exists
    public change(document: vscode.TextDocument, _event?: vscode.TextDocumentContentChangeEvent[]): void {
        const tempPath: string = this.getTempPath(document);
        // Skip if not already open and will not be open in the pending requests
        if (this.tempFilePool.has(document.uri.fsPath) || this.pending.open.has(document.uri.fsPath)) {
            this.pending.change.set(tempPath, document.getText());
        }
    }

    // Delete the temp file, release the management of synchronizer
    public close(document: vscode.TextDocument): void {
        const tempPath: string = this.getTempPath(document);
        if (this.tempFilePool.has(document.uri.fsPath)) {
            this.pending.close.set(document.uri.fsPath, tempPath);
        } // Skip if already closed
    }

    // Do the actual IO operartion, sending out all pending requests
    public async flush(): Promise<void> {
        for (const [filePath, tempPath] of this.pending.open.entries()) {
            this.appendPromise(tempPath, fse.createFile(tempPath));
            this.tempFilePool.set(filePath, tempPath);
        }

        for (const [tempPath, content] of this.pending.change.entries()) {
            this.appendPromise(tempPath, fse.writeFile(tempPath, content));
        }

        for (const [filePath, tempPath] of this.pending.close.entries()) {
            this.appendPromise(tempPath, fse.remove(tempPath));
            this.tempFilePool.delete(filePath);
        }

        this.pending = { open: new Map(), change: new Map(), close: new Map() };
        await Promise.all(this.pendingPromises.values());
    }

    private getTempPath(document: vscode.TextDocument): string {
        const tempPath: string | undefined = this.tempFilePool.get(document.uri.fsPath);
        if (tempPath) {
            return tempPath;
        }
        const tempFile: string = `${crypto.createHash('md5').update(document.uri.fsPath).digest('hex')}.${document.languageId}`;
        return path.join(this.tempStorage, tempFile);
    }

    private getTempStorage(): string {
        const storagePath: string | undefined = this.context.storagePath;
        if (!storagePath) {
            return path.join(os.tmpdir(), `vscode_checkstyle_sync_${Math.random().toString(36).slice(2, 10)}`);
        }
        return path.join(storagePath, 'sync');
    }

    private appendPromise(file: string, nextPromise: Promise<void>): void {
        this.pendingPromises.set(file, (async (): Promise<void> => {
            await this.pendingPromises.get(file);
            await nextPromise;
        })());
    }
}
