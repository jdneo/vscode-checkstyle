// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { Diagnostic, Disposable, StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { checkstyleDiagnosticCollector } from './checkstyleDiagnosticCollector';
import { CheckstyleExtensionCommands } from './constants/commands';

class CheckstyleStatusBar implements Disposable {
    private statusBar: StatusBarItem;

    constructor() {
        this.statusBar = window.createStatusBarItem(StatusBarAlignment.Right);
        this.statusBar.show();
    }

    public showStatus(): void {
        if (!window.activeTextEditor) {
            this.statusBar.hide();
            return;
        }
        this.clearStatus();
        const diagnostics: Diagnostic[] | undefined = checkstyleDiagnosticCollector.getDiagnostics(window.activeTextEditor.document.uri);
        if (!diagnostics) {
            this.statusBar.hide();
            return;
        }

        this.statusBar.text = diagnostics.length !== 0 ? '$(bug)' : '$(check)';
        this.statusBar.tooltip = `[Checkstyle] ${diagnostics.length} violation${diagnostics.length === 1 ? '' : 's'} found`;
        this.statusBar.show();
    }

    public showError(): void {
        this.statusBar.text = '$(stop)';
        this.statusBar.tooltip = `[Checkstyle] Internal error occurred`;
        this.statusBar.command = CheckstyleExtensionCommands.OPEN_OUTPUT_CHANNEL;
        this.statusBar.show();
    }

    public dispose(): void {
        this.statusBar.dispose();
    }

    private clearStatus(): void {
        this.statusBar.command = undefined;
        this.statusBar.text = '';
        this.statusBar.tooltip = undefined;
    }
}

export const checkstyleStatusBar: CheckstyleStatusBar = new CheckstyleStatusBar();
