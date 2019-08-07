// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as crypto from 'crypto';
import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { checkstyleChannel } from '../checkstyleChannel';

export class SyncedFile {
    constructor(
        public readonly document: vscode.TextDocument,
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
        } else {
            this.synchronizer.change(e.document, e.contentChanges);
        }
    }
}

interface ISyncRequests {
    write: Map<string, string>; // Real file path -> new content
    remove: Set<string>; // Real files to be closed and removed
}

// tslint:disable-next-line: max-classes-per-file
export class FileSynchronizer implements vscode.Disposable {

    private tempStorage: string = this.getTempStorage();
    private tempFilePool: Map<string, string> = new Map(); // managed file path -> temp path
    private pendingRequests: ISyncRequests = { write: new Map(), remove: new Set() };
    private pendingPromises: Map<string, Promise<void>> = new Map();

    constructor(private context: vscode.ExtensionContext) {}

    public dispose(): void {
        fse.remove(this.tempStorage);
    }

    public hasTempUri(realUri: vscode.Uri): boolean {
        return this.tempFilePool.has(realUri.fsPath);
    }

    public getTempUri(realUri: vscode.Uri): vscode.Uri | undefined {
        const tempPath: string | undefined = this.tempFilePool.get(realUri.fsPath);
        if (tempPath) {
            return vscode.Uri.file(tempPath);
        }
        return undefined;
    }

    // Ensure a file created in temp folder and managed by synchronizer
    public open(document: vscode.TextDocument): void {
        // Cancel pending remove request
        if (this.pendingRequests.remove.has(document.fileName)) {
            this.pendingRequests.remove.delete(document.fileName);
        }
        // Skip if already open
        if (!this.tempFilePool.has(document.fileName)) {
            this.pendingRequests.write.set(document.fileName, document.getText());
        }
    }

    // Change content of temp file that already exists
    public change(document: vscode.TextDocument, _event?: vscode.TextDocumentContentChangeEvent[]): void {
        // Skip if there's pending remove request
        if (this.pendingRequests.remove.has(document.fileName)) {
            return;
        }
        // Skip if not open
        if (this.tempFilePool.has(document.fileName)) {
            this.pendingRequests.write.set(document.fileName, document.getText());
        }
    }

    // Delete the temp file, release the management of synchronizer
    public close(document: vscode.TextDocument): void {
        // Cancel the pending write request
        if (this.pendingRequests.write.has(document.fileName)) {
            this.pendingRequests.write.delete(document.fileName);
        }
        // Skip if already closed
        if (this.tempFilePool.has(document.fileName)) {
            this.pendingRequests.remove.add(document.fileName);
        }
    }

    // Do the actual IO operartion, sending out all pending requests
    public async flush(): Promise<void> {
        for (const [filePath, content] of this.pendingRequests.write.entries()) {
            this.setSyncPromise(filePath, async (tempPath: string) => { // When IO faliure occurs, temp path will be updated
                await fse.ensureFile(tempPath);
                await fse.writeFile(tempPath, content);
                this.tempFilePool.set(filePath, tempPath); // Set or update temp path mapping
            });
        }

        for (const filePath of this.pendingRequests.remove.values()) {
            this.setSyncPromise(filePath, async (tempPath: string) => {
                await fse.remove(tempPath);
                this.tempFilePool.delete(filePath);
            });
        }

        this.pendingRequests = { write: new Map(), remove: new Set() };
        await Promise.all(this.pendingPromises.values());
    }

    private setSyncPromise(filePath: string, syncTask: (temp: string) => Promise<void>): void {
        this.pendingPromises.set(filePath, (async (): Promise<void> => {
            await this.pendingPromises.get(filePath); // Ensure IO sequence
            let tempPath: string = this.ensureTempPath(filePath);
            let failCount: number = 0;
            while (failCount < 5) {
                try {
                    await syncTask(tempPath);
                    break;
                } catch (error) { // Error in IO task, e.g. file occupied
                    checkstyleChannel.appendLine(error.toString());
                    tempPath = this.ensureTempPath(tempPath); // Compute a new temp path
                    failCount += 1;
                }
            }
            if (failCount >= 5) {
                vscode.window.showErrorMessage('Sync file IO error after 5 trials.');
            }
        })());
    }

    private ensureTempPath(realPath: string): string {
        let tempPath: string | undefined = this.tempFilePool.get(realPath);
        if (!tempPath) {
            const tempHash: string = crypto.createHash('md5').update(realPath).digest('hex');
            tempPath = path.join(this.tempStorage, tempHash, path.basename(realPath));
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
