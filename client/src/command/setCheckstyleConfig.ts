'use strict';

import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import {
    ConfigurationTarget,
    ExtensionContext,
    Uri,
    window,
    workspace
} from 'vscode';
import * as xml2js from 'xml2js';
import { extensionGlobalPath } from '../checkStyleSetting';
import { IUserInterface, Pick } from '../IUserInterface';
import { VSCodeUI } from '../VSCodeUI';
import { ISettingDetail, updateSettings } from './common/updateSettings';

enum ConfigurationType {
    GoogleChecks = 'google_checks',
    SunChecks = 'sun_checks',
    Customized = '$(file-directory) Browse...'
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
        const propertiesFoundInConfig: string[] = extractProperties(root);
        if (propertiesFoundInConfig.length > 0) {
            const propertyPathInSetting: string = await workspace.getConfiguration('checkstyle', settingDetail.uri).get<string>('propertiesPath');
            const propertyString: string = await resolvePropertyContents(propertiesFoundInConfig, propertyPathInSetting);
            const propertyPath: string = resolveProperyPath(settingDetail, context);
            await savePropertyPathInSetting(settingDetail, propertyPath, propertyString);
            await window.showTextDocument(Uri.file(propertyPath), { preview: false });
            await window.showInformationMessage('Please provide property values for the Checkstlye configuration file.');
        }
    }
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
                if (child.$.default) {
                    continue;
                }
                const result: string[] = child.$.value.match(/^.*\${(.*)}.*$/);
                if (result) {
                    propertyNames.push(result[1]);
                }
            }
        }
    }
}

async function resolvePropertyContents(propertiesFoundInConfig: string[], propertyPathInSetting: string): Promise<string> {
    if (propertyPathInSetting && await fse.pathExists(propertyPathInSetting)) {
        const content: string = await fse.readFile(propertyPathInSetting, 'utf8');
        const lines: string[] = content.split('\n');
        const existingProperties: Map<string, string> = new Map<string, string>();
        lines.forEach((line: string) => {
            const keyVal: string[] = line.trim().split('=');
            if (keyVal && keyVal.length >= 2) {
                existingProperties.set(keyVal[0].trim(), keyVal[1].trim());
            }
        });
        const propertyWrittenToFile: string[] = [];
        propertiesFoundInConfig.forEach((property: string) => {
            if (existingProperties.has(property)) {
                propertyWrittenToFile.push(`${property}=${existingProperties.get(property)}`);
            } else {
                propertyWrittenToFile.push(`${property}=`);
            }
        });
        return propertyWrittenToFile.join(os.EOL);
    } else {
        return `${propertiesFoundInConfig.join(`=${os.EOL}`)}=`;
    }
}

function resolveProperyPath(settingDetail: ISettingDetail, context: ExtensionContext): string {
    let basePath: string;
    switch (settingDetail.target) {
        case ConfigurationTarget.Global:
            basePath = extensionGlobalPath;
            break;
        case ConfigurationTarget.Workspace:
            basePath = context.storagePath;
            break;
        case ConfigurationTarget.WorkspaceFolder:
            basePath = settingDetail.uri.fsPath;
            break;
        default:
            break;
    }
    return path.join(basePath, '.checkstyle.properties');
}

async function savePropertyPathInSetting(settingDetail: ISettingDetail, propertyPath: string, propertyString: string): Promise<void> {
    await fse.ensureFile(propertyPath);
    await fse.writeFile(propertyPath, propertyString);
    await workspace.getConfiguration('checkstyle', settingDetail.uri).update('propertiesPath', propertyPath, settingDetail.target);
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
    // tslint:disable-next-line:no-reserved-keywords
    default?: string;
}
