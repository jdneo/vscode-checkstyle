'use strict';

import { TextEditor, Uri, window } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { CheckStyleRequest } from '../CheckStyleRequest';

export function checkCodeWithCheckstyle(client: LanguageClient, fileUri?: Uri): void {
    let uri: string;
    if (!fileUri) {
        const textEditor: TextEditor = window.activeTextEditor;
        if (!textEditor) {
            return;
        }
        uri = textEditor.document.uri.toString();
    } else {
        uri = fileUri.fsPath;
    }
    client.sendRequest(CheckStyleRequest.requestType, { textDocument: { uri } });
}
