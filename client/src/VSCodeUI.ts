'use strict';
import {
    OpenDialogOptions,
    Uri,
    window,
    workspace
} from 'vscode';

import * as vscode from 'vscode';
import { UserCancelledError } from 'vscode-azureextensionui';
import { IUserInterface, Pick, PickWithData } from './IUserInterface';

export class VSCodeUI implements IUserInterface {
    public async showQuickPick<T>(items: PickWithData<T>[] | Thenable<PickWithData<T>[]>, placeHolder: string, ignoreFocusOut?: boolean): Promise<PickWithData<T>>;
    public async showQuickPick(items: Pick[] | Thenable<Pick[]>, placeHolder: string, ignoreFocusOut?: boolean): Promise<Pick>;
    public async showQuickPick(items: vscode.QuickPickItem[] | Thenable<vscode.QuickPickItem[]>, placeHolder: string, ignoreFocusOut: boolean = false): Promise<vscode.QuickPickItem> {
        const options: vscode.QuickPickOptions = {
            placeHolder: placeHolder,
            ignoreFocusOut: ignoreFocusOut
        };
        const result: vscode.QuickPickItem | undefined = await vscode.window.showQuickPick(items, options);

        if (!result) {
            throw new UserCancelledError();
        } else {
            return result;
        }
    }

    public async showInputBox(placeHolder: string, prompt: string, ignoreFocusOut: boolean = false, validateInput?: (s: string) => string | undefined | null, defaultValue?: string): Promise<string> {
        const options: vscode.InputBoxOptions = {
            placeHolder: placeHolder,
            prompt: prompt,
            validateInput: validateInput,
            ignoreFocusOut: ignoreFocusOut,
            value: defaultValue
        };
        const result: string | undefined = await vscode.window.showInputBox(options);

        if (!result) {
            throw new UserCancelledError();
        } else {
            return result;
        }
    }

    public async showFolderDialog(filter?: {}): Promise<string> {
        const defaultUri: Uri | undefined = workspace.rootPath ? Uri.file(workspace.rootPath) : undefined;
        const options: OpenDialogOptions = {
            defaultUri: defaultUri,
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            openLabel: 'Select'
        };
        if (filter) {
            options.filters = filter;
        }
        const result: Uri[] | undefined = await window.showOpenDialog(options);
        if (!result || result.length === 0) {
            throw new UserCancelledError();
        } else {
            return result[0].fsPath;
        }
    }
}
