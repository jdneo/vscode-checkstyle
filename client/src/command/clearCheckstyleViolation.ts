'use strict';

import { TextEditor, Uri, window } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { CheckStatus} from '../notifications';
import { StatusController } from '../StatusController';

export function clearCheckstyleViolation(client: LanguageClient, statusController: StatusController, fileUri?: Uri): void {
    if (!fileUri) {
        const textEditor: TextEditor = window.activeTextEditor;
        if (!textEditor) {
            return;
        }
        fileUri = textEditor.document.uri;
    }
    client.diagnostics.delete(fileUri);
    client.outputChannel.appendLine(`Checkstyle violations cleaned for file: ${fileUri.fsPath}.`);
    statusController.updateStatusBar({uri: fileUri.toString(), state: CheckStatus.wait});
}
