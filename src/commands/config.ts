// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as fse from 'fs-extra';
import * as path from 'path';
import { QuickPickItem, Uri, window, workspace, WorkspaceFolder } from 'vscode';
import * as xmljs from 'xml-js';
import { BuiltinConfiguration, DoctypePublicIds } from '../constants/checkstyleConfigs';
import { getDefaultWorkspaceFolder, setCheckstyleConfigurationPath, tryAsWorkspaceEnvPath } from '../utils/settingUtils';

export async function setConfiguration(uri?: Uri): Promise<void> {
    if (uri) {
        if (path.extname(uri.fsPath).toLowerCase() === '.xml') {
            setCheckstyleConfigurationPath(tryAsWorkspaceEnvPath(uri.fsPath), uri);
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
    const detectedConfigurations: QuickPickItem[] = await detectConfigurations();
    const items: QuickPickItem[] = [
        ...detectedConfigurations,
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
    return results && results[0] && tryAsWorkspaceEnvPath(results[0].path);
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

async function detectConfigurations(): Promise<QuickPickItem[]> {
    const detected: QuickPickItem[] = [];
    for (const xml of await workspace.findFiles('**/*.xml')) {
        const relativeXml: string = tryAsWorkspaceEnvPath(xml.fsPath);
        function doctypeFn(doctype: string): void {
            const [name, type] = doctype.split(/\s+/, 2);
            if (type.toUpperCase() === 'PUBLIC') {
                const pubid: string = doctype.match(/"(.+)"/)![1];
                if (DoctypePublicIds.includes(pubid)) {
                    detected.push({ label: relativeXml, detail: xml.fsPath });
                }
            } else if (type.toUpperCase() === 'SYSTEM') {
                if (name === 'module') {
                    detected.push({ label: relativeXml, detail: xml.fsPath });
                }
            }
        }
        xmljs.xml2js(await fse.readFile(xml.fsPath, 'utf8'), { doctypeFn });
    }
    return detected;
}
