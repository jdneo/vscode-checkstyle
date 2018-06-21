'use strict';

import { EventEmitter } from 'events';
import { ClientCapabilities, DidChangeConfigurationParams, TextDocument, TextDocumentChangeEvent, TextDocuments } from 'vscode-languageserver';
import { DEFAULT_SETTINGS, ICheckStyleSettings } from './checkstyleSetting';
import { Connector } from './Connector';

export class DocumentConfigProvider extends EventEmitter {
    private _hasConfigurationCapability: boolean;
    private _documentSettings: Map<string, Thenable<ICheckStyleSettings>>;
    private _documents: TextDocuments;
    private _globalSettings: ICheckStyleSettings;
    private _connector: Connector;

    constructor(connector: Connector) {
        super();
        this._documentSettings = new Map();
        this._documents = new TextDocuments();
        this._hasConfigurationCapability = false;
        this._connector = connector;
        this._globalSettings = DEFAULT_SETTINGS;
    }

    public bindListeners(): void {
        this._documents.onDidClose((event: TextDocumentChangeEvent) => {
            this._documentSettings.delete(event.document.uri);
        });

        this._documents.onDidOpen(async (event: TextDocumentChangeEvent) => {
            this.emit('requestCheck', event.document.uri);
        });

        this._documents.onDidSave(async (event: TextDocumentChangeEvent) => {
            this.emit('requestCheck', event.document.uri);
        });

        this._connector.on('initializing', (capabilities: ClientCapabilities) => {
            this._hasConfigurationCapability = !!(capabilities.workspace && capabilities.workspace.configuration);
        });

        this._connector.on('configurationChanged', (change: DidChangeConfigurationParams) => {
            if (this._hasConfigurationCapability) {
                this._documentSettings.clear();
            } else {
                this._globalSettings = <ICheckStyleSettings>(change.settings.checkstyle || DEFAULT_SETTINGS);
            }
            this._documents.all().forEach(async (doc: TextDocument) => {
                this.emit('requestCheck', doc.uri);
            });
        });
    }

    public startListening(): void {
        this._documents.listen(this._connector.connection);
    }

    public getDocumentSettings(resource: string): Thenable<ICheckStyleSettings> {
        if (!this._hasConfigurationCapability) {
            return Promise.resolve(this._globalSettings);
        }
        let result: Thenable<ICheckStyleSettings> | undefined = this._documentSettings.get(resource);
        if (!result) {
            result = this._connector.connection.workspace.getConfiguration({ scopeUri: resource });
            this._documentSettings.set(resource, result);
        }
        return result;
    }

}
