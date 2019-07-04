// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as path from 'path';
import { Uri, window } from 'vscode';
import { checkstyleChannel } from '../checkstyleChannel';
import { checkstyleDiagnosticCollector } from '../checkstyleDiagnosticCollector';
import { checkstyleStatusBar } from '../checkstyleStatusBar';
import { CheckstyleExtensionCommands } from '../constants/commands';
import { ICheckstyleResult } from '../models';
import { handleErrors } from '../utils/errorUtils';
import { getCheckstyleConfigurationPath, getCheckstyleProperties } from '../utils/settingUtils';
import { executeJavaLanguageServerCommand } from './executeJavaLanguageServerCommand';

export async function checkstyle(uri?: Uri): Promise<void> {
    if (!uri) {
        if (!window.activeTextEditor) {
            return;
        }
        uri = window.activeTextEditor.document.uri;
    }

    if (path.extname(uri.fsPath).toLocaleLowerCase() !== '.java') {
        return;
    }

    checkstyleDiagnosticCollector.delete(uri);

    const configurationPath: string = getCheckstyleConfigurationPath(uri);
    if (configurationPath === '') {
        checkstyleChannel.appendLine('Checkstyle configuration file not set yet, skip the check.');
        return;
    }

    try {
        const results: ICheckstyleResult[] | undefined = await executeJavaLanguageServerCommand<ICheckstyleResult[]>(
            CheckstyleExtensionCommands.CHECK_CODE_WITH_CHECKSTYLE, uri.toString(), configurationPath, getCheckstyleProperties(uri));
        if (!results) {
            checkstyleChannel.appendLine('Unable to get results from Language Server.');
            return;
        }
        checkstyleDiagnosticCollector.addDiagnostics(uri, results);
        checkstyleStatusBar.showStatus();
    } catch (error) {
        handleErrors(error);
    }
}
