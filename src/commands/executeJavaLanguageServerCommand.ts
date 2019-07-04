// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { commands } from 'vscode';
import { checkstyleChannel } from '../checkstyleChannel';
import { JavaLanguageServerCommands } from '../constants/commands';

export function executeJavaLanguageServerCommand<T>(...args: any[]): Thenable<T | undefined> {
    checkstyleChannel.appendLine(`[Info] Executing command: ${JSON.stringify({ id: args[0], arguments: args.slice(1) })}`);
    return commands.executeCommand<T>(JavaLanguageServerCommands.EXECUTE_WORKSPACE_COMMAND, ...args);
}
