'use strict';

import {
    TextEditor,
    window
} from 'vscode';
import {
    LanguageClient,
    RequestType,
    TextDocumentIdentifier
} from 'vscode-languageclient';

namespace CheckStyleRequest {
    export const requestType: RequestType<ICheckstyleParams, void, void, void> = new RequestType<ICheckstyleParams, void, void, void>('textDocument/checkstyle');
}

interface ICheckstyleParams {
    readonly textDocument: TextDocumentIdentifier;
}

export function checkCodeWithCheckstyle(client: LanguageClient): void {
    const textEditor: TextEditor = window.activeTextEditor;
    if (!textEditor) {
        return;
    }
    const uri: string = textEditor.document.uri.toString();
    client.sendRequest(CheckStyleRequest.requestType, { textDocument: { uri } });
}
