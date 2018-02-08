'use strict';

import * as fse from 'fs-extra';
import * as path from 'path';
import { Uri } from 'vscode';
import { IUserInterface, Pick } from '../IUserInterface';
import { VSCodeUI } from '../VSCodeUI';
import { updateSettings } from './common/updateSettings';

export async function setCheckstyleVersion(resourcesPath: string, uri?: Uri, ui: IUserInterface = new VSCodeUI()): Promise<void> {
    const checkstyleFileRegex: RegExp = /^checkstyle-(\d\.\d{1,2}(?:\.\d)?)-all.jar$/;
    const versionPicks: Pick[] = [];
    for (const item of await fse.readdir(resourcesPath)) {
        const stats: fse.Stats = await fse.stat(path.join(resourcesPath, item));
        const match: string[] = item.match(checkstyleFileRegex);
        if (match && stats.isFile()) {
            versionPicks.push(new Pick(match[1]));
        }
    }
    versionPicks.push(new Pick(VersionType.CustomVersion), new Pick(VersionType.CustomPath));
    const choice: string = (await ui.showQuickPick(versionPicks, 'Select the Checkstyle version')).label;
    let result: string;
    switch (choice) {
        case VersionType.CustomVersion:
            result = await ui.showInputBox('version', 'Provide the value of version', false, validateVersionNumber);
            break;
        case VersionType.CustomPath:
            result = await ui.showFolderDialog({ Jar: ['jar'] });
            break;
        default:
            result = choice;
            break;
    }
    await updateSettings(new Map([['version', result]]), ui, uri);
}

function validateVersionNumber(input: string): string | undefined {
    if (!input) {
        return 'The input cannot be empty';
    }
    if (!input.match(/^\d\.\d{1,2}(\.\d)?$/)) {
        return 'The version number is invalid';
    }
    return undefined;
}

enum VersionType {
    CustomVersion = '$(tag) Enter a version number...',
    CustomPath = '$(file-directory) Select a local Checkstyle jar...'
}
