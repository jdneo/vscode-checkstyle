'use strict';

import { EventEmitter } from "events";
import { Connection, createConnection, DidChangeConfigurationParams, InitializeParams, ProposedFeatures, TextDocumentSyncKind } from 'vscode-languageserver';
import { CheckStyleRequest, ICheckstyleParams } from './CheckStyleRequest';

export class Connector extends EventEmitter {
    private _connection: any;

    constructor() {
        super();
        this._connection = createConnection(ProposedFeatures.all);
    }

    public bindListeners(): void {
        this._connection.onInitialize((params: InitializeParams) => {
            this.emit('initializing', params.capabilities);
            return {
                capabilities: {
                    textDocumentSync: TextDocumentSyncKind.Full
                }
            };
        });

        this._connection.onInitialized(() => {
            this.emit('initialized');
        });

        this._connection.onDidChangeConfiguration((change: DidChangeConfigurationParams) => {
            this.emit('configurationChanged', change);
        });

        this._connection.onRequest(CheckStyleRequest.requestType, (params: ICheckstyleParams) => {
            this.emit('requestCheck', params.textDocument.uri);
        });
    }

    public startListening(): void {
        this._connection.listen();
    }

    public get connection(): Connection {
        return this._connection;
    }
}
