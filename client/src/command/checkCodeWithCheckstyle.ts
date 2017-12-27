'use strict';

import { TextEditor, window } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { CheckStyleRequest } from '../CheckStyleRequest';

export function checkCodeWithCheckstyle(client: LanguageClient): void {
    const textEditor: TextEditor = window.activeTextEditor;
    if (!textEditor) {
        return;
    }
    const uri: string = textEditor.document.uri.toString();
    client.sendRequest(CheckStyleRequest.requestType, { textDocument: { uri } });
}
