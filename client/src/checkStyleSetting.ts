'use strict';

import * as os from 'os';
import * as path from 'path';

export const extensionGlobalPath: string = path.join(os.homedir(), '.vscode', 'vscode-checkstyle');

export interface ICheckStyleSettings {
    autocheck: boolean;
    version: string;
    configurationFile: string;
    propertiesPath: string;
}
