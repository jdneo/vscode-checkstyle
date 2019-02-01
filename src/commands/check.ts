import * as fse from 'fs-extra';
import * as path from 'path';
import { Uri, window } from 'vscode';
import { checkstyleDiagnosticCollector } from '../CheckstyleDiagnosticCollector';
import { BuiltinConfiguration } from '../constants/BuiltinConfiguration';
import { CheckstyleExtensionCommands } from '../constants/commands';
import { ICheckstyleResult } from '../models';
import { getCheckstyleConfigurationPath, getCheckstyleProperties } from '../utils/settingUtils';
import { executeJavaLanguageServerCommand } from './executeJavaLanguageServerCommand';

export async function checkstyle(uri?: Uri): Promise<void> {
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

    const configurationPath: string = getCheckstyleConfigurationPath(uri);
    if (configurationPath === '') {
        window.showErrorMessage('The path of the Checkstyle configuration file has not been set, please set it first.');
        return;
    }
    if (!isBuiltinConfiguration(configurationPath) && !await fse.pathExists(configurationPath)) {
        window.showErrorMessage('The Checkstyle configuration file does not exist. Please make sure it is set correctly.');
        return;
    }

    const results: ICheckstyleResult[] | undefined = await executeJavaLanguageServerCommand<ICheckstyleResult[]>(
        CheckstyleExtensionCommands.CHECK_CODE_WITH_CHECKSTYLE, uri.toString(), configurationPath, getCheckstyleProperties(uri));
    if (!results) {
        // TODO: log
        return;
    }
    checkstyleDiagnosticCollector.addDiagnostics(uri, results);
}

function isBuiltinConfiguration(config: string): boolean {
    return config === BuiltinConfiguration.GoogleCheck || config === BuiltinConfiguration.SunCheck;
}
