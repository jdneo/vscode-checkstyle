import { Uri, workspace } from 'vscode';
import * as ls from 'vscode-languageserver-protocol';
import { CheckstyleExtensionCommands } from '../constants/commands';
import { executeJavaLanguageServerCommand } from '../utils/lsCommandUtils';
import { asWorkspaceEdit } from '../utils/quickFixUtils';
import { checkstyle } from './check';

export async function fixCheckstyleViolation(uri: Uri, offset: number, sourceName: string): Promise<void> {
    const workspaceEdit: ls.WorkspaceEdit | undefined = await executeJavaLanguageServerCommand<ls.WorkspaceEdit>(
        CheckstyleExtensionCommands.FIX_CHECKSTYLE_VIOLATION, uri.toString(), offset, sourceName);
    if (!workspaceEdit) {
        // TODO: log
        return;
    }
    await workspace.applyEdit(asWorkspaceEdit(workspaceEdit));
    await checkstyle(uri);
}
