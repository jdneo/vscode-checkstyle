'use strict';

import {
    ConfigurationTarget,
    Uri,
    workspace,
    WorkspaceConfiguration,
    WorkspaceFolder
} from 'vscode';
import { IUserInterface, PickWithData } from '../IUserInterface';
import { VSCodeUI } from '../VSCodeUI';

export async function setCheckstyleJar(ui: IUserInterface = new VSCodeUI()): Promise<void> {
    await updateSetting(SettingType.JarPath, 'jarPath', ui);
}

export async function setCheckstyleConfig(ui: IUserInterface = new VSCodeUI()): Promise<void> {
    await updateSetting(SettingType.ConfigPath, 'configPath', ui);
}

async function updateSetting(settingType: SettingType, key: string, ui: IUserInterface): Promise<void> {
    let result: string | undefined;
    switch (settingType) {
        case SettingType.JarPath:
            result = await ui.showFolderDialog({ Jar: ['jar'] });
            break;
        case SettingType.ConfigPath:
            result = await ui.showFolderDialog({ XML: ['xml'] });
            break;
        default:
            break;
    }
    let settingTargets: PickWithData<ConfigurationTarget>[] = [
        new PickWithData<ConfigurationTarget>(ConfigurationTarget.Global, 'Application', 'User Settings')
    ];
    if (workspace.workspaceFolders) {
        settingTargets = settingTargets.concat(
            new PickWithData<ConfigurationTarget>(ConfigurationTarget.Workspace, 'Workspace', 'Workspace Settings'),
            new PickWithData<ConfigurationTarget>(ConfigurationTarget.WorkspaceFolder, 'Workspace Folder', 'Workspace Folder Settings')
        );
    }
    const target: ConfigurationTarget = settingTargets.length === 1 ? settingTargets[0].data : (await ui.showQuickPick(settingTargets, 'Select the target to which this setting should be applied')).data;
    let config: WorkspaceConfiguration = workspace.getConfiguration('checkstyle');
    if (target === ConfigurationTarget.WorkspaceFolder) {
        if (workspace.workspaceFolders.length === 1) {
            config = workspace.getConfiguration('checkstyle', workspace.workspaceFolders[0].uri);
        } else {
            const folderPicks: PickWithData<Uri>[] = workspace.workspaceFolders.map((f: WorkspaceFolder) => new PickWithData(f.uri, f.uri.fsPath));
            const folderUri: Uri = (await ui.showQuickPick<Uri>(folderPicks, 'Pick Workspace Folder to which this setting should be applied')).data;
            config = workspace.getConfiguration('checkstyle', folderUri);
        }
    }
    config.update(key, result, target);
}

enum SettingType {
    JarPath,
    ConfigPath
}
