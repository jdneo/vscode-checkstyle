// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as path from 'path';
import { OpenDialogOptions, QuickPickItem, Uri, window, WorkspaceFolder } from 'vscode';
import { checkstyleChannel } from '../checkstyleChannel';
import { checkstyleDiagnosticCollector } from '../checkstyleDiagnosticCollector';
import { checkstyleDiagnosticManager } from '../checkstyleDiagnosticManager';
import { BuiltinConfiguration } from '../constants/BuiltinConfiguration';
import { CheckstyleServerCommands } from '../constants/commands';
import { ICheckstyleResult } from '../models';
import { handleErrors } from '../utils/errorUtils';
import { getCheckstyleConfigurationPath, getCheckstyleProperties, getDefaultWorkspaceFolder, setCheckstyleConfigurationPath } from '../utils/settingUtils';
import { executeJavaLanguageServerCommand } from './executeJavaLanguageServerCommand';

export async function setCheckstyleConfiguration(uri?: Uri): Promise<void> {
    if (uri) {
        if (path.extname(uri.fsPath).toLowerCase() === '.xml') {
            setCheckstyleConfigurationPath(uri.fsPath, uri);
        } else {
            window.showErrorMessage('Invalid Checkstyle configuration file');
            return;
        }
    } else {
        const choice: string | undefined = await selectConfigurationSource();
        if (!choice) {
            return;
        }
        switch (choice) {
            case ConfigurationSelction.Browse:
                const selectedConfig: Uri | undefined = await browseForConfiguration();
                if (!selectedConfig) {
                    return;
                }
                setCheckstyleConfigurationPath(selectedConfig.fsPath, selectedConfig);
                break;
            case ConfigurationSelction.GoogleStyle:
                setCheckstyleConfigurationPath(BuiltinConfiguration.GoogleCheck);
                break;
            case ConfigurationSelction.SunStyle:
                setCheckstyleConfigurationPath(BuiltinConfiguration.SunCheck);
                break;
            default:
                return;
        }
    }
    window.showInformationMessage('Successfully set the Checkstyle configuration.');
}

async function selectConfigurationSource(): Promise<string | undefined> {
    const items: QuickPickItem[] = [
        {
            label: ConfigurationSelction.Browse,
            detail: 'Select a Checkstyle configuration file in your file system.',
        },
        {
            label: ConfigurationSelction.GoogleStyle,
        },
        {
            label: ConfigurationSelction.SunStyle,
        },
    ];
    const result: QuickPickItem | undefined = await window.showQuickPick(items, { ignoreFocusOut: true });
    if (result) {
        return result.label;
    }
    return undefined;
}

async function browseForConfiguration(): Promise<Uri | undefined> {
    const workspaceFolder: WorkspaceFolder | undefined = getDefaultWorkspaceFolder();
    const defaultUri: Uri | undefined = workspaceFolder && workspaceFolder.uri;
    const options: OpenDialogOptions = {
        defaultUri,
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: 'Select',
        filters: { 'Checkstyle Configuration': ['xml'] },
    };
    const result: Uri[] | undefined = await window.showOpenDialog(options);
    if (result && result.length > 0) {
        return result[0];
    }
    return undefined;
}

enum ConfigurationSelction {
    GoogleStyle = "Google's Style",
    SunStyle = "Sun's Style",
    Browse = '$(file-text) Browse...',
}

export async function setServerConfiguration(): Promise<void> {
    const configurationPath: string = getCheckstyleConfigurationPath();
    if (!configurationPath) {
        checkstyleChannel.appendLine('Checkstyle configuration file not set yet, skip the check.');
        checkstyleDiagnosticManager.dispose();
        checkstyleDiagnosticCollector.clear();
        return;
    }
    try {
        await executeJavaLanguageServerCommand<{ [file: string]: ICheckstyleResult[] }>(
            CheckstyleServerCommands.SET_CONFIGURATION,
            configurationPath,
            getCheckstyleProperties(),
        );
        checkstyleDiagnosticManager.activate();
        checkstyleDiagnosticManager.getDiagnostics(checkstyleDiagnosticCollector.getResourceUris());
    } catch (error) {
        handleErrors(error);
        checkstyleDiagnosticManager.dispose();
        checkstyleDiagnosticCollector.clear();
    }
}
