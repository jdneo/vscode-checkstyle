'use strict';

import {
    ConfigurationTarget,
    Uri,
    workspace,
    WorkspaceConfiguration,
    WorkspaceFolder
} from 'vscode';
import { IUserInterface, PickWithData } from '../../IUserInterface';

export interface ISettingDetail {
    target: ConfigurationTarget;
    uri?: Uri;
}

export async function updateSettings(settingPairs: Map<string, any>, ui: IUserInterface, uri?: Uri): Promise<ISettingDetail> {
    let config: WorkspaceConfiguration;
    let target: ConfigurationTarget;
    const settingDetail: ISettingDetail = { target: undefined, uri: undefined };
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

        settingDetail.target = target = settingTargets.length === 1 ?
                settingTargets[0].data :
                (await ui.showQuickPick(settingTargets, 'Select the target to which this setting should be applied')).data;
        if (target === ConfigurationTarget.WorkspaceFolder) {
            if (workspace.workspaceFolders.length === 1) {
                config = workspace.getConfiguration('checkstyle', workspace.workspaceFolders[0].uri);
            } else {
                const folderPicks: PickWithData<Uri>[] = workspace.workspaceFolders.map((f: WorkspaceFolder) => new PickWithData(f.uri, f.uri.fsPath));
                const folderUri: Uri = settingDetail.uri = (await ui.showQuickPick<Uri>(folderPicks, 'Pick Workspace Folder to which this setting should be applied')).data;
                config = workspace.getConfiguration('checkstyle', folderUri);
            }
        } else {
            config = workspace.getConfiguration('checkstyle');
        }
    }
    settingPairs.forEach(async (value: any, key: string) => {
        await config.update(key, value, target);
    });
    return settingDetail;
}
