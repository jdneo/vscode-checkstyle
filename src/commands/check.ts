import * as fse from 'fs-extra';
import * as path from 'path';
import { Uri, window, workspace } from 'vscode';
import { checkstyleDiagnosticCollector } from '../CheckstyleDiagnosticCollector';
import { CheckstyleExtensionCommands } from '../constants/commands';
import { JAVA_CHECKSTYLE_CONFIGURATION } from '../constants/configs';
import { ICheckstyleResult } from '../models';
import { executeJavaLanguageServerCommand } from '../utils/lsCommandUtils';

export async function checkstyle(uri: Uri): Promise<void> {
    if (!uri) {
        if (!window.activeTextEditor) {
            return;
        }
        uri = window.activeTextEditor.document.uri;
        if (path.extname(uri.fsPath).toLocaleLowerCase() !== '.java') {
            return;
        }
    }
    checkstyleDiagnosticCollector.delete(uri);

    const configurationPath: string = workspace.getConfiguration(undefined, uri).get(JAVA_CHECKSTYLE_CONFIGURATION, '');
    if (configurationPath === '') {
        window.showErrorMessage('The path of the Checkstyle configuration file is not set, please set it first.');
        return;
    }
    if (!await fse.pathExists(configurationPath)) {
        window.showErrorMessage('The Checkstyle configuration file does not exist. Please make sure it is set correctly.');
        return;
    }
    const results: ICheckstyleResult[] | undefined = await executeJavaLanguageServerCommand<ICheckstyleResult[]>(
        CheckstyleExtensionCommands.CHECK_CODE_WITH_CHECKSTYLE, uri.toString(), configurationPath);
    if (!results) {
        // TODO: log
        return;
    }
    checkstyleDiagnosticCollector.addDiagnostics(uri, results);
}
