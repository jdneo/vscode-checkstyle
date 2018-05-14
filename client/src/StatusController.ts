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

    public updateStatusBar(status?: ICheckStatusParams): void {
        if (status) {
            this._statusMap.set(status.uri, status.state);
        }

        const activeEditor: TextEditor | undefined = window.activeTextEditor;

        if (activeEditor.document.uri.toString() === status.uri) {
            switch (status.state) {
                case CheckStatus.success:
                    this._statusbar.text = '$(check) Checkstyle';
                    break;
                case CheckStatus.fail:
                    this._statusbar.text = '$(bug) Checkstyle';
                    break;
                case CheckStatus.exception:
                    this._statusbar.text = '$(stop) Checkstyle';
                    break;
                case CheckStatus.wait:
                default:
                    this._statusbar.text = '$(pencil) Checkstyle';
                    break;
            }
        }

        if (status.state === undefined || status.state === CheckStatus.wait) {
            this._statusbar.command = 'checkstyle.checkCodeWithCheckstyle';
            this._statusbar.tooltip = 'Check code with Checkstyle';
        } else {
            this._statusbar.command = 'checkstyle.showOutputChannel';
            this._statusbar.tooltip = 'Open Checkstyle Ouput Channel';
        }

        this.showStatusBarItem(
            window.activeTextEditor.document.languageId === 'java' &&
            this._serverRunning
        );
    }

    public onServerStatusDidChange(status: ServerStatus): void {
        if (status === ServerStatus.running) {
            this._serverRunning = true;
        } else {
            this._serverRunning = false;
        }
        this.updateStatusBar();
    }

    public onDidChangeTextDocument(event: TextDocumentChangeEvent): void {
        const uri: Uri = event.document.uri;
        const autocheck: boolean = workspace.getConfiguration('checkstyle', uri).get<boolean>('autocheck');
        if (!autocheck) {
            this._statusMap.delete(uri.toString());
            this.updateStatusBar();
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
