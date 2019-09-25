// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as fse from 'fs-extra';
import * as path from 'path';
import { Uri, window, WorkspaceFolder } from 'vscode';
import * as xmljs from 'xml-js';
import { checkstyleChannel } from '../checkstyleChannel';
import { BuiltinConfiguration, checkstyleDoctypeIds } from '../constants/checkstyleConfigs';
import { IQuickPickItemEx } from '../models';
import { setCheckstyleConfigurationPath } from '../utils/settingUtils';
import { findNonIgnoredFiles, getDefaultWorkspaceFolder, tryUseWorkspaceFolder } from '../utils/workspaceUtils';

export async function setConfiguration(uri?: Uri): Promise<void> {
    if (uri) {
        if (path.extname(uri.fsPath).toLowerCase() === '.xml') {
            setCheckstyleConfigurationPath(tryUseWorkspaceFolder(uri.fsPath), uri);
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
    const detectedConfigurations: IQuickPickItemEx[] = await detectConfigurations();
    const items: IQuickPickItemEx[] = [
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
            label: '$(link) Use URL...',
            detail: 'Use a Checkstyle configuration accessible via HTTP.',
            value: ':input',
        },
        {
            label: '$(file-text) Browse...',
            detail: 'Select a configuration file from your file system.',
            value: ':browse',
        },
    ];
    const result: IQuickPickItemEx | undefined = await window.showQuickPick(items, { ignoreFocusOut: true });
    if (!result) {
        return undefined;
    } else if (result.value === ':browse') {
        return await browseForConfiguration();
    } else if (result.value === ':input') {
        return await inputConfiguration();
    } else {
        return result.label;
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
    return results && results[0] && tryUseWorkspaceFolder(results[0].path);
}

async function inputConfiguration(): Promise<string | undefined> {
    const configPath: string | undefined = await window.showInputBox({
        prompt: 'Enter configuration URL here.',
        placeHolder: 'Supports http(s)://...',
        value: 'https://',
        ignoreFocusOut: true,
    });
    return configPath && configPath.trim();
}

async function detectConfigurations(): Promise<IQuickPickItemEx[]> {
    const detected: IQuickPickItemEx[] = [];
    for (const xml of await findNonIgnoredFiles('**/*.xml')) {
        const relativeXml: string = tryUseWorkspaceFolder(xml.fsPath);
        function doctypeFn(doctype: string): void {
            const [name, type] = doctype.split(/\s+/, 2);
            if (type.toUpperCase() === 'PUBLIC') {
                const pubid: string = doctype.match(/"(.+)"/)![1];
                if (checkstyleDoctypeIds.includes(pubid)) {
                    detected.push({ label: relativeXml, detail: xml.fsPath });
                }
            } else if (type.toUpperCase() === 'SYSTEM') {
                if (name === 'module') {
                    detected.push({ label: relativeXml, detail: xml.fsPath });
                }
            }
        }
        try {
            xmljs.xml2js(await fse.readFile(xml.fsPath, 'utf8'), { doctypeFn });
        } catch (error) { // Skip this xml, continue detecting process
            checkstyleChannel.appendLine(`Parse failed: ${xml}`);
        }
    }
    return detected;
}
