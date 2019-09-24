// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as path from 'path';
import { Uri, window, workspace, WorkspaceFolder } from 'vscode';

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

export function tryUseWorkspaceFolder(fsPath: string): string {
    const result: string = workspace.asRelativePath(fsPath);
    if (result === fsPath) {
        return result;
    } else {
        return path.join('${workspaceFolder}', result);
    }
}

const workspaceRegexp: RegExp = /\$\{workspacefolder\}/i;

export function resolveVariables(value: string, resourceUri?: Uri): string {
    let workspaceFolder: WorkspaceFolder | undefined;
    if (resourceUri) {
        workspaceFolder = workspace.getWorkspaceFolder(resourceUri);
    } else {
        workspaceFolder = getDefaultWorkspaceFolder();
    }
    if (workspaceRegexp.test(value)) {
        if (!workspaceFolder) {
            throw Error('workspaceFolder not loaded when ${workspaceFolder} is present');
        }
        return value.replace(workspaceRegexp, workspaceFolder.uri.fsPath);
    }
    return value;
}
