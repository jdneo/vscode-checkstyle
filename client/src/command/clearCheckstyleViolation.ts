'use strict';

import { TextEditor, Uri, window } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';

export function clearCheckstyleViolation(client: LanguageClient, fileUri?: Uri): void {
    if (!fileUri) {
        const textEditor: TextEditor = window.activeTextEditor;
        if (!textEditor) {
            return;
        }
        fileUri = textEditor.document.uri;
    }
    client.diagnostics.delete(fileUri);
}
