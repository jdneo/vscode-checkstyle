// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as vscode from 'vscode';
import { checkstyleChannel } from '../checkstyleChannel';
import { checkstyleConfigurationManager } from '../checkstyleConfigurationManager';
import { checkstyleStatusBar } from '../checkstyleStatusBar';

export async function handleErrors(error: Error): Promise<void> {
    if (error['data']) {
        const message: string = error['data'].message;
        if (message.startsWith('cannot initialize module')) {
            handleModuleIntialization(message);
        }
        checkstyleChannel.appendLine(JSON.stringify(error['data']));
    } else {
        checkstyleChannel.appendLine(error.stack || error.toString());
    }

    checkstyleStatusBar.showError();
}

async function handleModuleIntialization(message: string): Promise<void> {
    const module: string = message.match(/cannot initialize module (.+) -/)![1];
    const choice: string | undefined = await vscode.window.showErrorMessage(
        `Module ${module} initialization failed. It may be caused by wrong configuraiton or incompatible version.`,
        'Select another version', 'Open Configuration',
    );
    if (choice === 'Select another version') {
        vscode.commands.executeCommand('java.checkstyle.setVersion');
    } else if (choice === 'Open Configuration') {
        if (checkstyleConfigurationManager.configUri) {
            vscode.workspace.openTextDocument(checkstyleConfigurationManager.configUri).then((document: vscode.TextDocument) => {
                return vscode.window.showTextDocument(document);
            });
        }
    }
}
