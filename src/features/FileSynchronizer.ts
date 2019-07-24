// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as crypto from 'crypto';
import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

export class SyncedFile {
    constructor(
        private readonly document: vscode.TextDocument,
        private readonly synchronizer: FileSynchronizer,
    ) { }

    public get realUri(): vscode.Uri {
        return this.document.uri;
    }

    public get tempUri(): vscode.Uri | undefined {
        return this.synchronizer.getTempUri(this.realUri);
    }

    public get syncUri(): vscode.Uri {
        return this.tempUri || this.realUri;
    }

    public open(): void {
        if (this.document.isDirty) {
            this.synchronizer.open(this.document);
            this.synchronizer.change(this.document);
        } else {
            // Delay the temp file creation until changing it
        }
    }

    public close(): void {
        this.synchronizer.close(this.document);
    }

    public async onContentChanged(e: vscode.TextDocumentChangeEvent): Promise<void> {
        if (!this.synchronizer.hasTempUri(this.realUri)) { // Lazy loading temp file
            this.synchronizer.open(this.document);
        }
        this.synchronizer.change(e.document, e.contentChanges);
    }
}

interface ISyncRequests {
    open: Set<string>; // Real files to be open and managed
    change: Map<string, string>; // Real file path -> new content
    close: Set<string>; // Real files to be closed and removed
}

// tslint:disable-next-line: max-classes-per-file
export class FileSynchronizer implements vscode.Disposable {

    private tempStorage: string = this.getTempStorage();
    private tempPathMap: Map<string, string> = new Map(); // file path -> temp path
    private managedFiles: Set<string> = new Set(); // owns managed real files
    private pending: ISyncRequests = { open: new Set(), change: new Map(), close: new Set() };
    private pendingPromises: Map<string, Promise<void>> = new Map();

    constructor(private context: vscode.ExtensionContext) {}

    public dispose(): void {
        fse.remove(this.tempStorage);
    }

    public hasTempUri(realUri: vscode.Uri): boolean {
        return this.managedFiles.has(realUri.fsPath);
    }

    public getTempUri(realUri: vscode.Uri): vscode.Uri | undefined {
        const tempPath: string | undefined = this.tempPathMap.get(realUri.fsPath);
        if (this.hasTempUri(realUri) && tempPath) {
            return vscode.Uri.file(tempPath);
        }
        return undefined;
    }

    // Ensure a file created in temp folder and managed by synchronizer
    public open(document: vscode.TextDocument): void {
        if (!this.managedFiles.has(document.uri.fsPath)) {
            this.pending.open.add(document.uri.fsPath);
        } // Skip if already open
    }

    // Change content of temp file that already exists
    public change(document: vscode.TextDocument, _event?: vscode.TextDocumentContentChangeEvent[]): void {
        // Skip if not already open and will not be open in the pending requests
        if (this.managedFiles.has(document.uri.fsPath) || this.pending.open.has(document.uri.fsPath)) {
            this.pending.change.set(document.uri.fsPath, document.getText());
        }
    }

    // Delete the temp file, release the management of synchronizer
    public close(document: vscode.TextDocument): void {
        if (this.managedFiles.has(document.uri.fsPath)) {
            this.pending.close.add(document.uri.fsPath);
        } // Skip if already closed
    }

    // Do the actual IO operartion, sending out all pending requests
    public async flush(): Promise<void> {
        for (const filePath of this.pending.open.values()) {
            this.setSyncPromise(filePath, fse.createFile);
            this.managedFiles.add(filePath);
        }

        for (const [filePath, content] of this.pending.change.entries()) {
            this.setSyncPromise(filePath, (temp: string) => fse.writeFile(temp, content));
        }

        for (const filePath of this.pending.close.values()) {
            this.setSyncPromise(filePath, fse.remove);
            this.managedFiles.delete(filePath);
        }

        this.pending = { open: new Set(), change: new Map(), close: new Set() };
        await Promise.all(this.pendingPromises.values());
    }

    private setSyncPromise(filePath: string, syncTask: (temp: string) => Promise<void>): void {
        this.pendingPromises.set(filePath, (async (): Promise<void> => {
            await this.pendingPromises.get(filePath); // Ensure IO sequence
            let tempPath: string = this.getTempPath(filePath);
            try {
                await syncTask(tempPath);
            } catch (error) { // Error in IO task, e.g. file occupied
                tempPath = this.getTempPath(tempPath); // Compute a new temp path
                this.tempPathMap.set(filePath, tempPath);
                await syncTask(tempPath); // If fails again, turn to next flush for new temp path
            }
        })());
    }

    private getTempPath(realPath: string): string {
        let tempPath: string | undefined = this.tempPathMap.get(realPath);
        if (!tempPath) {
            const tempHash: string = crypto.createHash('md5').update(realPath).digest('hex');
            tempPath = path.join(this.tempStorage, `${tempHash}.${path.extname(realPath)}`);
            this.tempPathMap.set(realPath, tempPath);
        }
        return tempPath;
    }

    private getTempStorage(): string {
        const storagePath: string | undefined = this.context.storagePath;
        if (!storagePath) {
            return path.join(os.tmpdir(), `vscode_checkstyle_sync_${Math.random().toString(36).slice(2, 10)}`);
        }
        return path.join(storagePath, 'sync');
    }
}
