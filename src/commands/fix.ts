import { Uri } from 'vscode';
import * as ls from 'vscode-languageserver-protocol';
import { CheckstyleExtensionCommands } from '../constants/commands';
import { applyWorkspaceEdit } from '../utils/editUtils';
import { executeJavaLanguageServerCommand } from './executeJavaLanguageServerCommand';

export async function fixCheckstyleViolation(uri: Uri, offset: number, sourceName: string): Promise<void> {
    const workspaceEdit: ls.WorkspaceEdit | undefined = await executeJavaLanguageServerCommand<ls.WorkspaceEdit>(
        CheckstyleExtensionCommands.FIX_CHECKSTYLE_VIOLATION, uri.toString(), offset, sourceName);
    if (!workspaceEdit) {
        // TODO: log
        return;
    }
    await applyWorkspaceEdit(workspaceEdit);
}
