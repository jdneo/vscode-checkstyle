import { Uri, workspace, WorkspaceEdit } from 'vscode';
import { CheckstyleExtensionCommands } from '../constants/commands';
import { executeJavaLanguageServerCommand } from '../utils/lsCommandUtils';

export async function fixCheckstyleViolation(uri: Uri, offset: number, sourceName: string): Promise<void> {
    const workspaceEdit: WorkspaceEdit | undefined = await executeJavaLanguageServerCommand<WorkspaceEdit>(
        CheckstyleExtensionCommands.FIX_CHECKSTYLE_VIOLATION, uri.toString(), offset, sourceName);
    if (!workspaceEdit) {
        // TODO: log
        return;
    }
    workspace.applyEdit(workspaceEdit);
}
