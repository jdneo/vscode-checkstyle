// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { Disposable, StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { checkstyleDiagnosticCollector } from './checkstyleDiagnosticCollector';
import { CheckstyleExtensionCommands } from './constants/commands';

class CheckstyleStatusBar implements Disposable {
    private statusBar: StatusBarItem;

    constructor() {
        this.statusBar = window.createStatusBarItem(StatusBarAlignment.Right);
        this.statusBar.show();
    }

    public showStatus(): void {
        this.clearStatus();
        let violations: number = 0;
        for (const diagnostics of checkstyleDiagnosticCollector.getAllDiagnostics()) {
            violations += diagnostics.length;
        }
        if (!violations) {
            this.statusBar.text = '$(check)';
            this.statusBar.tooltip = '[Checkstyle] no violation found';
        } else {
            this.statusBar.text = '$(bug)';
            this.statusBar.tooltip = `[Checkstyle] ${violations} violation${violations === 1 ? '' : 's'} found`;
            this.statusBar.command = 'workbench.action.problems.focus';
        }
        this.statusBar.show();
    }

    public showError(reason?: string): void {
        this.statusBar.text = '$(stop)';
        this.statusBar.tooltip = `[Checkstyle] ${reason || 'Internal error occurred'}`;
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
