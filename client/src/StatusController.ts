'use strict';

import {
    StatusBarAlignment,
    StatusBarItem,
    TextDocument,
    TextEditor,
    window
} from 'vscode';
import { State as ClientState, StateChangeEvent } from 'vscode-languageclient';
import { IStatusParams, Status } from './notifications';

export class StatusController {
    private _statusbar: StatusBarItem;
    private _serverRunning: boolean;
    private _statusMap: Map<string, Status>;

    constructor() {
        this._statusbar = window.createStatusBarItem(StatusBarAlignment.Right, 0);
        this._statusbar.text = 'Checkstyle';
        this._statusbar.command = 'checkstyle.checkCodeWithCheckstyle';
        this._serverRunning = false;
        this._statusMap = new Map();
    }

    public updateStatusBar(editor: TextEditor | undefined, status?: IStatusParams): void {
        if (status) {
            this._statusMap.set(status.uri, status.state);
        }

        if (!editor) {
            this.showStatusBarItem(false);
            return;
        }

        if (this._statusMap.has(editor.document.uri.toString())) {
            switch (this._statusMap.get(editor.document.uri.toString())) {
                case Status.ok:
                    this._statusbar.text = '$(check) Checkstyle';
                    break;
                case Status.warn:
                    this._statusbar.text = '$(alert) Checkstyle';
                    break;
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

    public onDidChangeState(event: StateChangeEvent): void {
        if (event.newState === ClientState.Running) {
            this._statusbar.tooltip = 'Checkstyle is running.';
            this._serverRunning = true;
        } else {
            this._statusbar.tooltip = 'Checkstyle has stopped.';
            this._serverRunning = false;
        }
        this.updateStatusBar(window.activeTextEditor);
    }

    public onCloseEditor(editor: TextDocument): void {
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
