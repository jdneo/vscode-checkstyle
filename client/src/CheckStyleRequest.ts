'use strict';

import { RequestType, TextDocumentIdentifier } from 'vscode-languageclient';

export namespace CheckStyleRequest {
    export const requestType: RequestType<ICheckstyleParams, void, void, void> = new RequestType<ICheckstyleParams, void, void, void>('checkstyle/textDocument');
}

interface ICheckstyleParams {
    readonly textDocument: TextDocumentIdentifier;
}
