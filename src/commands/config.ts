// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as path from 'path';
import { QuickPickItem, Uri, window, WorkspaceFolder } from 'vscode';
import { BuiltinConfiguration } from '../constants/checkstyleConfigs';
import { getDefaultWorkspaceFolder, setCheckstyleConfigurationPath } from '../utils/settingUtils';

export async function setConfiguration(uri?: Uri): Promise<void> {
    if (uri) {
        if (path.extname(uri.fsPath).toLowerCase() === '.xml') {
            setCheckstyleConfigurationPath(uri.fsPath, uri);
        } else {
            window.showErrorMessage('Invalid Checkstyle configuration file');
            return;
        }
    } else {
        const choice: string | undefined = await queryForConfiguration();
        if (!choice) {
            return;
        }
        setCheckstyleConfigurationPath(choice);
    }
    window.showInformationMessage('Successfully set the Checkstyle configuration.');
}

async function queryForConfiguration(): Promise<string | undefined> {
    const items: QuickPickItem[] = [
        {
            label: BuiltinConfiguration.GoogleCheck,
            detail: "(Built-in) Google's Style",
        },
        {
            label: BuiltinConfiguration.SunCheck,
            detail: "(Built-in) Sun's Style",
        },
        {
            label: '$(pencil) Write directly...',
            detail: 'Write your configuration path in input box (e.g. from HTTP URL).',
        },
        {
            label: '$(file-text) Browse...',
            detail: 'Select a configuration file from your file system.',
        },
    ];
    const result: QuickPickItem | undefined = await window.showQuickPick(items, { ignoreFocusOut: true });
    if (result === items.slice(-1)[0]) {
        return await browseForConfiguration();
    } else if (result === items.slice(-2)[0]) {
        return await inputConfiguration();
    } else {
        return result && result.label;
    }
}

async function browseForConfiguration(): Promise<string | undefined> {
    const workspaceFolder: WorkspaceFolder | undefined = getDefaultWorkspaceFolder();
    const defaultUri: Uri | undefined = workspaceFolder && workspaceFolder.uri;
    const results: Uri[] | undefined = await window.showOpenDialog({
        defaultUri,
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: 'Select',
        filters: { 'Checkstyle Configuration': ['xml'] },
    });
    return results && results[0].path;
}

async function inputConfiguration(): Promise<string | undefined> {
    const configPath: string | undefined = await window.showInputBox({
        prompt: 'Enter configuration path here.',
        placeHolder: 'Supports http(s)://...',
        value: 'https://',
        ignoreFocusOut: true,
    });
    return configPath && configPath.trim();
}
