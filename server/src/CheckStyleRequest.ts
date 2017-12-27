'use strict';

import { RequestType, TextDocumentIdentifier } from 'vscode-languageserver';

export interface ICheckstyleParams {
    readonly textDocument: TextDocumentIdentifier;
}

export namespace CheckStyleRequest {
    export const requestType: RequestType<ICheckstyleParams, void, void, void> = new RequestType<ICheckstyleParams, void, void, void>('checkstyle/textDocument');
}
