'use strict';

import {
    StatusBarAlignment,
    StatusBarItem,
    TextDocument,
    TextDocumentChangeEvent,
    TextEditor,
    Uri,
    window,
    workspace
} from 'vscode';
import {
    CheckStatus,
    ICheckStatusParams,
    ServerStatus
} from './notifications';

export class StatusController {
    private _statusbar: StatusBarItem;
    private _serverRunning: boolean;
    private _statusMap: Map<string, CheckStatus>;

    constructor() {
        this._statusbar = window.createStatusBarItem(StatusBarAlignment.Right, 0);
        this._statusbar.text = '$(pencil) Checkstyle';
        this._statusbar.command = 'checkstyle.checkCodeWithCheckstyle';
        this._statusbar.tooltip = 'Check code with Checkstyle';
        this._serverRunning = false;
        this._statusMap = new Map();
    }

    public updateStatusBar(editor: TextEditor | undefined, status?: ICheckStatusParams): void {
        if (status) {
            this._statusMap.set(status.uri, status.state);
        }

        if (!editor) {
            this.showStatusBarItem(false);
            return;
        }

        if (this._statusMap.has(editor.document.uri.toString())) {
            switch (this._statusMap.get(editor.document.uri.toString())) {
                case CheckStatus.ok:
                    this._statusbar.text = '$(check) Checkstyle';
                    break;
                case CheckStatus.bug:
                    this._statusbar.text = '$(bug) Checkstyle';
                    break;
                case CheckStatus.error:
                this._statusbar.text = '$(stop) Checkstyle';
                default:
                    break;
            }
        } else {
            this._statusbar.text = '$(pencil) Checkstyle';
        }

        this.showStatusBarItem(
            editor.document.languageId === 'java' &&
            this._serverRunning
        );
    }

    public onServerStatusDidChange(status: ServerStatus): void {
        if (status === ServerStatus.Running) {
            this._serverRunning = true;
        } else {
            this._serverRunning = false;
        }
        this.updateStatusBar(window.activeTextEditor);
    }

    public onDidChangeTextDocument(event: TextDocumentChangeEvent): void {
        const uri: Uri = event.document.uri;
        const autocheck: boolean = workspace.getConfiguration('checkstyle', uri).get<boolean>('autocheck');
        if (!autocheck) {
            this._statusMap.delete(uri.toString());
            this.updateStatusBar(window.activeTextEditor);
        }
    }

    public onDidCloseTextDocument(editor: TextDocument): void {
        this._statusMap.delete(editor.uri.toString());
    }

    public dispose(): void {
        if (this._statusbar) {
            this._statusbar.dispose();
        }
        if (this._statusMap) {
            this._statusMap.clear();
            this._statusMap = undefined;
        }
    }

    private showStatusBarItem(show: boolean): void {
        if (show) {
            this._statusbar.show();
        } else {
            this._statusbar.hide();
        }
    }
}
