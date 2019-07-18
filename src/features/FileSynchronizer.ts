import * as crypto from 'crypto';
import * as fse from 'fs-extra';
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
export class FileSynchronizer {

    private tempFilePool: Map<string, string> = new Map(); // managed filePath -> tempPath
    private pending: ISyncRequests = { open: new Map(), change: new Map(), close: new Map() };
    private lastFlush: Promise<void[]>;

    constructor(private context: vscode.ExtensionContext) {}

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
        // Wait for last flush to complete
        await this.lastFlush;
        const pendingPromises: Map<string, Promise<void>> = new Map();

        for (const [filePath, tempPath] of this.pending.open.entries()) {
            pendingPromises.set(tempPath, (async (): Promise<void> => {
                if (!await fse.pathExists(tempPath)) {
                    await fse.createFile(tempPath);
                }
            })());
            this.tempFilePool.set(filePath, tempPath);
        }

        for (const [tempPath, content] of this.pending.change.entries()) {
            pendingPromises.set(tempPath, (async (): Promise<void> => {
                await pendingPromises.get(tempPath); // Wait for potential open request first
                await fse.writeFile(tempPath, content);
            })());
        }

        for (const [filePath, tempPath] of this.pending.close.entries()) {
            pendingPromises.set(tempPath, fse.remove(tempPath));
            this.tempFilePool.delete(filePath);
        }

        this.pending = { open: new Map(), change: new Map(), close: new Map() };
        this.lastFlush = Promise.all(pendingPromises.values());
        await this.lastFlush;
    }

    private getTempPath(document: vscode.TextDocument): string {
        if (this.tempFilePool.has(document.uri.fsPath)) {
            return this.tempFilePool.get(document.uri.fsPath)!;
        }
        const tempStorage: string | undefined = this.context.storagePath;
        if (!tempStorage) {
            throw Error('Open a folder first'); // Todo: create in tmp folder?
        }
        const tempFile: string = `${crypto.createHash('md5').update(document.uri.fsPath).digest('hex')}.${document.languageId}`;
        return path.join(tempStorage, tempFile);
    }
}
