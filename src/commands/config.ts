// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as path from 'path';
import { OpenDialogOptions, QuickPickItem, Uri, window, WorkspaceFolder } from 'vscode';
import { BuiltinConfiguration } from '../constants/checkstyleConfigs';
import { getDefaultWorkspaceFolder, setCheckstyleConfigurationPath } from '../utils/settingUtils';

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
