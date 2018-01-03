'use strict';

import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import {
    ConfigurationTarget,
    ExtensionContext,
    TextDocument,
    Uri,
    window,
    workspace,
    WorkspaceConfiguration,
    WorkspaceFolder
} from 'vscode';
import * as xml2js from 'xml2js';
import { extensionGlobalPath } from '../checkStyleSetting';
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

export async function setCheckstyleConfig(context: ExtensionContext, ui: IUserInterface = new VSCodeUI()): Promise<void> {
    const configPicks: Pick[] = [
        new Pick(ConfigurationType.GoogleChecks),
        new Pick(ConfigurationType.SunChecks),
        new Pick(ConfigurationType.Customized)
    ];
    let config: string = (await ui.showQuickPick(configPicks, 'Select the Checkstyle configuration')).label;
    if (config === ConfigurationType.Customized) {
        config = await ui.showFolderDialog({ XML: ['xml'] });
    }
    const settingDetail: ISettingDetail = await updateSettings(new Map([['configurationFile', config]]), ui);
    if (config !== ConfigurationType.GoogleChecks && config !== ConfigurationType.SunChecks) {
        const root: IModule = await resolveXml(config);
        const properties: string[] = extractProperties(root);
        if (properties.length > 0) {
            const propertyString: string = `${properties.join(`=${os.EOL}`)}=`;
            let propertyPath: string;
            switch (settingDetail.target) {
                case ConfigurationTarget.Global:
                    propertyPath = path.join(extensionGlobalPath, '.checkstyle.properties');
                    break;
                case ConfigurationTarget.Workspace:
                    propertyPath = path.join(context.storagePath, '.checkstyle.properties');
                    break;
                case ConfigurationTarget.WorkspaceFolder:
                    propertyPath = path.join(settingDetail.uri.fsPath, '.checkstyle.properties');
                    break;
                default:
                    break;
            }
            await fse.ensureFile(propertyPath);
            await fse.writeFile(propertyPath, propertyString);
            await workspace.getConfiguration('checkstyle', settingDetail.uri).update('propertiesPath', propertyPath, settingDetail.target);
            const doc: TextDocument = await workspace.openTextDocument(Uri.file(propertyPath));
            await window.showTextDocument(doc);
            await window.showInformationMessage('Please provide property values for the Checkstlye configuration file.');
        }
    }
}

export async function setAutoCheckStatus(ui: IUserInterface = new VSCodeUI()): Promise<void> {
    const statusPicks: PickWithData<boolean>[] = [
        new PickWithData<boolean>(true, '$(check) On'),
        new PickWithData<boolean>(false, '$(x) Off')
    ];
    const status: boolean = (await ui.showQuickPick(statusPicks, 'Select the autocheck status')).data;
    await updateSettings(new Map([['autocheck', status]]), ui);
}

async function updateSettings(settingPairs: Map<string, any>, ui: IUserInterface, uri?: Uri): Promise<ISettingDetail> {
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

function validateVersionNumber(input: string): string | undefined {
    if (!input) {
        return 'The input cannot be empty';
    }
    if (!input.match(/^\d\.\d{1,2}(\.\d)?$/)) {
        return 'The version number is invalid';
    }
    return undefined;
}

async function resolveXml(xmlPath: string): Promise<IModule> {
    return await new Promise(async (resolve: (ret: IModule) => void, reject: (e: Error) => void): Promise<void> => {
        const configString: string = await fse.readFile(xmlPath, 'utf8');
        xml2js.parseString(configString, (err: any, result: any): void => {
            if (err) {
                reject(err);
            } else {
                resolve(result.module);
            }
        });
    });
}

function extractProperties(configModule: IModule): string[] {
    const propertyNames: string[] = [];
    if (configModule) {
        extractPropertyNames(configModule.property, propertyNames);
        if (configModule.module) {
            for (const child of configModule.module) {
                propertyNames.push.apply(propertyNames, extractProperties(child));
            }
        }
    }
    return propertyNames;
}

function extractPropertyNames(property: IProperty[], propertyNames: string[]): void {
    if (property) {
        for (const child of property) {
            if (child.$ && child.$.value) {
                const result: string[] = child.$.value.match(/^.*\${(.*)}.*$/);
                if (result) {
                    propertyNames.push(result[1]);
                }
            }
        }
    }
}

interface IModule {
    $: IAttribute;
    // tslint:disable-next-line:no-reserved-keywords
    module?: IModule[];
    property?: IProperty[];
}

interface IProperty {
    $?: IAttribute;
}

interface IAttribute {
    name?: string;
    value?: string;
}

interface ISettingDetail {
    target: ConfigurationTarget;
    uri?: Uri;
}
