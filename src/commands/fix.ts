// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { Uri } from 'vscode';
import * as ls from 'vscode-languageserver-protocol';
import { checkstyleChannel } from '../checkstyleChannel';
import { CheckstyleExtensionCommands, CheckstyleServerCommands } from '../constants/commands';
import { applyWorkspaceEdit } from '../utils/editUtils';
import { handleErrors } from '../utils/errorUtils';
import { executeJavaLanguageServerCommand } from './executeJavaLanguageServerCommand';

export async function fixCheckstyleViolation(uri: Uri, offset: number, sourceName: string): Promise<void> {
    try {
        const workspaceEdit: ls.WorkspaceEdit | undefined = await executeJavaLanguageServerCommand<ls.WorkspaceEdit>(
            CheckstyleServerCommands.QUICK_FIX, uri.toString(), offset, sourceName);
        if (!workspaceEdit) {
            checkstyleChannel.appendLine('Unable to get quick fix item from Language Server.');
            return;
        }
        await applyWorkspaceEdit(workspaceEdit);
    } catch (error) {
        handleErrors(error);
    }
}
