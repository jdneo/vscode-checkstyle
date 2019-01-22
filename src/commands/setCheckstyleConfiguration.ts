import * as path from 'path';
import { OpenDialogOptions, Uri, window, workspace, WorkspaceFolder } from 'vscode';
import { setCheckstyleConfigurationPath } from '../utils/settingUtils';

export async function setCheckstyleConfiguration(uri?: Uri): Promise<void> {
    if (!uri) {
        const defaultUri: Uri | undefined = getDefaultUri();
        const options: OpenDialogOptions = {
            defaultUri,
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            openLabel: 'Select',
            filters: {'Checkstyle Configuration': ['xml']},
        };
        const result: Uri[] | undefined = await window.showOpenDialog(options);
        if (result && result.length > 0) {
            uri = result[0];
        }
    }

    if (uri) {
        if (path.extname(uri.fsPath).toLowerCase() === 'xml') {
            setCheckstyleConfigurationPath(uri.fsPath, uri);
        }
    }
}

function getDefaultUri(): Uri | undefined {
    const workspaceFolders: WorkspaceFolder[] | undefined = workspace.workspaceFolders;
    if (workspaceFolders === undefined) {
        return undefined;
    }
    if (workspaceFolders.length === 1) {
        return workspaceFolders[0].uri;
    }
    if (window.activeTextEditor) {
        const activeWorkspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(window.activeTextEditor.document.uri);
        return activeWorkspaceFolder ? activeWorkspaceFolder.uri : undefined;
    }
    return undefined;
}
