// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { Uri, window, workspace, WorkspaceConfiguration, WorkspaceFolder } from 'vscode';
import { JAVA_CHECKSTYLE_AUTOCHECK, JAVA_CHECKSTYLE_CONFIGURATION, JAVA_CHECKSTYLE_PROPERTIES } from '../constants/configs';

export function getCheckstyleConfigurationPath(uri?: Uri): string {
    const configurationPath: string = getConfiguration(uri).get<string>(JAVA_CHECKSTYLE_CONFIGURATION, '');
    return resolveVariables(configurationPath, uri);
}

export function getCheckstyleConfigurationUri(uri?: Uri): Uri {
    const configPath: string = getCheckstyleConfigurationPath(uri);
    if (/^([c-zC-Z]:)?[/\\]/.test(configPath)) { // Starts with / or X:/ or X:\, where X is a Windows disk drive
        return Uri.file(configPath);
    } else {
        return Uri.parse(configPath);
    }
}

export function getCheckstyleProperties(uri?: Uri): object {
    const properties: {} = workspace.getConfiguration(undefined, uri).get(JAVA_CHECKSTYLE_PROPERTIES, {});
    for (const key of Object.keys(properties)) {
        properties[key] = resolveVariables(resolveVariables(properties[key], uri), uri);
    }
    return properties;
}

export function isAutoCheckEnabled(): boolean {
    return getConfiguration().get<boolean>(JAVA_CHECKSTYLE_AUTOCHECK, true);
}

export function setCheckstyleConfigurationPath(fsPath: string, uri?: Uri): void {
    setConfiguration(JAVA_CHECKSTYLE_CONFIGURATION, fsPath, uri);
}

const workspaceRegexp: RegExp = /\$\{workspacefolder\}/i;
function resolveVariables(value: string, resourceUri?: Uri): string {
    if (!resourceUri) {
        if (!window.activeTextEditor) {
            return value;
        }
        resourceUri = window.activeTextEditor.document.uri;
    }
    const workspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(resourceUri);
    if (!workspaceFolder) {
        return value;
    }
    if (workspaceRegexp.test(value)) {
        return value.replace(workspaceRegexp, workspaceFolder.uri.fsPath);
    }
    return value;
}

function getConfiguration(uri?: Uri): WorkspaceConfiguration {
    return workspace.getConfiguration(undefined, uri);
}

function setConfiguration(section: string, value: any, uri?: Uri): void {
    if (!uri && window.activeTextEditor) {
        uri = window.activeTextEditor.document.uri;
    }
    getConfiguration(uri).update(section, value);
}
