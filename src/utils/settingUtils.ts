// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as path from 'path';
import { ConfigurationTarget, Uri, window, workspace, WorkspaceConfiguration, WorkspaceFolder } from 'vscode';
import { JAVA_CHECKSTYLE_AUTOCHECK, JAVA_CHECKSTYLE_CONFIGURATION, JAVA_CHECKSTYLE_PROPERTIES, JAVA_CHECKSTYLE_VERSION } from '../constants/settings';

export function setCheckstyleConfigurationPath(fsPath: string, uri?: Uri): void {
    setConfiguration(JAVA_CHECKSTYLE_CONFIGURATION, fsPath, uri);
}

export function getCheckstyleConfigurationPath(uri?: Uri): string {
    const configurationPath: string = getConfiguration(uri).get<string>(JAVA_CHECKSTYLE_CONFIGURATION, '');
    return resolveVariables(configurationPath, uri);
}

export function setCheckstyleVersionString(version: string, uri?: Uri): void {
    setConfiguration(JAVA_CHECKSTYLE_VERSION, version, uri);
}

export function getCheckstyleVersionString(uri?: Uri): string {
    const version: string = getConfiguration(uri).get<string>(JAVA_CHECKSTYLE_VERSION)!;
    return resolveVariables(version, uri);
}

export function getCheckstyleProperties(uri?: Uri): object {
    const properties: {} = getConfiguration(uri).get(JAVA_CHECKSTYLE_PROPERTIES, {});
    for (const key of Object.keys(properties)) {
        properties[key] = resolveVariables(resolveVariables(properties[key], uri), uri);
    }
    return properties;
}

export function getDefaultWorkspaceFolder(): WorkspaceFolder | undefined {
    const workspaceFolders: WorkspaceFolder[] | undefined = workspace.workspaceFolders;
    if (workspaceFolders === undefined) {
        return undefined;
    }
    if (workspaceFolders.length === 1) {
        return workspaceFolders[0];
    }
    if (window.activeTextEditor) {
        const activeWorkspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(window.activeTextEditor.document.uri);
        return activeWorkspaceFolder;
    }
    return undefined;
}

export function isAutoCheckEnabled(): boolean {
    return getConfiguration().get<boolean>(JAVA_CHECKSTYLE_AUTOCHECK, true);
}

export function tryUseWorkspaceFolder(fsPath: string): string {
    const result: string = workspace.asRelativePath(fsPath);
    if (result === fsPath) {
        return result;
    } else {
        return path.join('${workspaceFolder}', result);
    }
}

export function getConfiguration(uri?: Uri): WorkspaceConfiguration {
    return workspace.getConfiguration(undefined, uri || null);
}

function setConfiguration(section: string, value: any, uri?: Uri): void {
    if (!uri && window.activeTextEditor) {
        uri = window.activeTextEditor.document.uri;
    }
    getConfiguration(uri).update(section, value, ConfigurationTarget.WorkspaceFolder);
}

const workspaceRegexp: RegExp = /\$\{workspacefolder\}/i;
function resolveVariables(value: string, resourceUri?: Uri): string {
    let workspaceFolder: WorkspaceFolder | undefined;
    if (resourceUri) {
        workspaceFolder = workspace.getWorkspaceFolder(resourceUri);
    } else {
        workspaceFolder = getDefaultWorkspaceFolder();
    }
    if (workspaceRegexp.test(value)) {
        if (!workspaceFolder) {
            throw new Error('No workspace folder is opened in current VS Code workspace when resolving ${workspaceFolder}');
        }
        return value.replace(workspaceRegexp, workspaceFolder.uri.fsPath);
    }
    return value;
}
