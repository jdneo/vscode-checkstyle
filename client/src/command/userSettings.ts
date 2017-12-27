'use strict';

import * as fse from 'fs-extra';
import * as path from 'path';
import {
    ConfigurationTarget,
    Uri,
    workspace,
    WorkspaceConfiguration,
    WorkspaceFolder
} from 'vscode';
import { IUserInterface, Pick, PickWithData } from '../IUserInterface';
import { VSCodeUI } from '../VSCodeUI';

enum ConfigurationType {
    GoogleChecks = 'google_checks',
    SunChecks = 'sun_checks',
    Customized = '$(file-directory) Browse...'
}

enum VersionType {
    CustomVersion = '$(tag) Enter a version number...',
    CustomPath = '$(file-directory) Browse for jar...'
}

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

export async function setCheckstyleProperties(ui: IUserInterface = new VSCodeUI()): Promise<void> {
    const result: string = await ui.showFolderDialog();
    await updateSettings(new Map([['propertiesPath', result]]), ui);
}

export async function setCheckstyleConfig(ui: IUserInterface = new VSCodeUI()): Promise<void> {
    const configPicks: Pick[] = [
        new Pick(ConfigurationType.GoogleChecks),
        new Pick(ConfigurationType.SunChecks),
        new Pick(ConfigurationType.Customized)
    ];
    let config: string = (await ui.showQuickPick(configPicks, 'Select the Checkstyle configuration')).label;
    if (config === ConfigurationType.Customized) {
        config = await ui.showFolderDialog({ XML: ['xml'] });
    }
    await updateSettings(new Map([['configurationFile', config]]), ui);
}

export async function setAutoCheckStatus(ui: IUserInterface = new VSCodeUI()): Promise<void> {
    const statusPicks: PickWithData<boolean>[] = [
        new PickWithData<boolean>(true, '$(check) On'),
        new PickWithData<boolean>(false, '$(x) Off')
    ];
    const status: boolean = (await ui.showQuickPick(statusPicks, 'Select the autocheck status')).data;
    await updateSettings(new Map([['autocheck', status]]), ui);
}

async function updateSettings(settingPairs: Map<string, any>, ui: IUserInterface, uri?: Uri): Promise<void> {
    let config: WorkspaceConfiguration;
    let target: ConfigurationTarget;
    if (uri) {
        config = workspace.getConfiguration('checkstyle', uri);
    } else {
        const settingTargets: PickWithData<ConfigurationTarget>[] = [
            new PickWithData<ConfigurationTarget>(ConfigurationTarget.Global, 'Application', 'User Settings')
        ];
        if (workspace.workspaceFolders) {
            settingTargets.push(new PickWithData<ConfigurationTarget>(ConfigurationTarget.Workspace, 'Workspace', 'Workspace Settings'));
            if (workspace.workspaceFolders.length > 1) {
                settingTargets.push(new PickWithData<ConfigurationTarget>(ConfigurationTarget.WorkspaceFolder, 'Workspace Folder', 'Workspace Folder Settings'));
            }
        }

        target = settingTargets.length === 1 ? settingTargets[0].data : (await ui.showQuickPick(settingTargets, 'Select the target to which this setting should be applied')).data;
        if (target === ConfigurationTarget.WorkspaceFolder) {
            if (workspace.workspaceFolders.length === 1) {
                config = workspace.getConfiguration('checkstyle', workspace.workspaceFolders[0].uri);
            } else {
                const folderPicks: PickWithData<Uri>[] = workspace.workspaceFolders.map((f: WorkspaceFolder) => new PickWithData(f.uri, f.uri.fsPath));
                const folderUri: Uri = (await ui.showQuickPick<Uri>(folderPicks, 'Pick Workspace Folder to which this setting should be applied')).data;
                config = workspace.getConfiguration('checkstyle', folderUri);
            }
        } else {
            config = workspace.getConfiguration('checkstyle');
        }
    }
    settingPairs.forEach((value: any, key: string) => {
        config.update(key, value, target);
    });
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
