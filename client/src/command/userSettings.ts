'use strict';

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
    Customized = '$(file) Browse...'
}

export async function setCheckstyleJar(ui: IUserInterface = new VSCodeUI()): Promise<void> {
    const result: string = await ui.showFolderDialog({ Jar: ['jar'] });
    await updateSetting('jarPath', result, ui);
}

export async function setCheckstyleProperties(ui: IUserInterface = new VSCodeUI()): Promise<void> {
    const result: string = await ui.showFolderDialog();
    await updateSetting('propertiesPath', result, ui);
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

    await updateSetting('configurationFile', config, ui);
}

export async function setAutoCheckStatus(ui: IUserInterface = new VSCodeUI()): Promise<void> {
    const statusPicks: PickWithData<boolean>[] = [
        new PickWithData<boolean>(true, '$(check) On'),
        new PickWithData<boolean>(false, '$(x) Off')
    ];
    const status: boolean = (await ui.showQuickPick(statusPicks, 'Select the autocheck status')).data;
    await updateSetting('autocheck', status, ui);
}

async function updateSetting(key: string, value: any, ui: IUserInterface): Promise<void> {
    const settingTargets: PickWithData<ConfigurationTarget>[] = [
        new PickWithData<ConfigurationTarget>(ConfigurationTarget.Global, 'Application', 'User Settings')
    ];
    if (workspace.workspaceFolders) {
        settingTargets.push(new PickWithData<ConfigurationTarget>(ConfigurationTarget.Workspace, 'Workspace', 'Workspace Settings'));
    }
    if (workspace.workspaceFolders.length > 1) {
        settingTargets.push(new PickWithData<ConfigurationTarget>(ConfigurationTarget.WorkspaceFolder, 'Workspace Folder', 'Workspace Folder Settings'));
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
    config.update(key, value, target);
}
