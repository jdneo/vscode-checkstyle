// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as cp from 'child_process';
import * as _ from 'lodash';
import * as path from 'path';
import { Uri, window, workspace, WorkspaceFolder } from 'vscode';
import { checkstyleChannel } from '../checkstyleChannel';

export function getDefaultWorkspaceFolder(): WorkspaceFolder | undefined {
  if (workspace.workspaceFolders === undefined) {
    return undefined;
  }
  if (workspace.workspaceFolders.length === 1) {
    return workspace.workspaceFolders[0];
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
      throw Error('No workspace folder is opened in current VS Code workspace when resolving ${workspaceFolder}'); // lgtm [js/template-syntax-in-string-literal]
    }
    return value.replace(workspaceRegexp, workspaceFolder.uri.fsPath);
  }
  return value;
}

// workspace.findFiles only defaults to exclude entires in files.exclude
// so it is not even able to exclude node_modules
// Refer to: https://github.com/Microsoft/vscode/issues/48674
export async function findNonIgnoredFiles(pattern: string): Promise<Uri[]> {
  let uris: Uri[] = await workspace.findFiles(pattern, `{${[
    ...Object.keys(await workspace.getConfiguration('search', null).get('exclude') || {}),
    ...Object.keys(await workspace.getConfiguration('files', null).get('exclude') || {}),
  ].join(',')}}`);

  const workspaceFolder: WorkspaceFolder | undefined = getDefaultWorkspaceFolder();
  if (workspaceFolder) {
    try { // tslint:disable-next-line: typedef
      const result: string = await new Promise<string>((resolve, reject) => {
        cp.exec(`git check-ignore ${uris.map((uri: Uri) => workspace.asRelativePath(uri)).join(' ')}`, {
          cwd: workspaceFolder.uri.fsPath,
        }, (error: Error & { code?: 0 | 1 | 128 }, stdout: string, stderr: string) => {
          if (error && (error.code !== 0 && error.code !== 1)) {
            reject(error);
          } else if (stderr) {
            reject(new Error(stderr));
          } else {
            resolve(stdout);
          }
        });
      });
      const excludes: Uri[] = result.trim().split('\n').map((relativePath: string) => {
        return Uri.file(path.join(workspaceFolder.uri.fsPath, relativePath.replace(/"(.+)"/, '$1')));
      });
      uris = _.differenceBy(uris, excludes, 'fsPath');
    } catch (error) {
      checkstyleChannel.appendLine(`git check-ignore exec error: ${error.toString()}`);
    }
  }

  return uris;
}
