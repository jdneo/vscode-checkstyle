'use strict';

import { Connector } from './Connector';
import { DocumentConfigProvider } from './DocumentConfigProvider';
import { LanguageServer } from './LanguageServer';

const connector: Connector = new Connector();
connector.bindListeners();

const documents: DocumentConfigProvider = new DocumentConfigProvider(connector);
documents.bindListeners();

const server: LanguageServer = new LanguageServer(connector, documents);
server.bindListeners();

connector.startListening();
documents.startListening();
