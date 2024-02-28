// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { commands } from 'vscode';
import { JavaLanguageServerCommands } from '../constants/commands';

export function executeJavaLanguageServerCommand<T>(...args: any[]): Thenable<T | undefined> {
  return commands.executeCommand<T>(JavaLanguageServerCommands.EXECUTE_WORKSPACE_COMMAND, ...args);
}
