'use strict';

import { Connector } from './Connector';
import { DocumentConfigProvider } from './DocumentConfigProvider';
import { Server } from './Server';

const connector: Connector = new Connector();
connector.bindListeners();

const documents: DocumentConfigProvider = new DocumentConfigProvider(connector);
documents.bindListeners();

const server: Server = new Server(connector, documents);
server.bindListeners();

connector.startListening();
documents.startListening();
