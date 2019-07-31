// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as fse from 'fs-extra';
import { Uri, window, workspace } from 'vscode';
import { checkstyleDiagnosticManager } from '../checkstyleDiagnosticManager';

export async function checkCode(uri?: Uri): Promise<void> {
    if (!uri) { // If not specified, check active editor
        if (!window.activeTextEditor) {
            return;
        }
        uri = window.activeTextEditor.document.uri;
    }
    let filesToCheck: Uri[];
    if ((await fse.stat(uri.fsPath)).isDirectory()) {
        filesToCheck = await workspace.findFiles(`${workspace.asRelativePath(uri)}/**/*.java`);
    } else {
        filesToCheck = [uri];
    }
    checkstyleDiagnosticManager.getDiagnostics(filesToCheck);
}
