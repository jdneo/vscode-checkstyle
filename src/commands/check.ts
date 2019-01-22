import { Uri } from 'vscode';
import { CheckstyleExtensionCommands } from '../constants/commands';
import { ICheckstyleResult } from '../models';
import { executeJavaLanguageServerCommand } from '../utils/lsCommandUtils';

export async function checkstyle(uris: Uri | Uri[]): Promise<void> {
    const results: ICheckstyleResult[] | undefined = await executeJavaLanguageServerCommand<ICheckstyleResult[]>(
        CheckstyleExtensionCommands.CHECK_CODE_WITH_CHECKSTYLE, uris);
    if (!results) {
        // TODO: log
        return;
    }
}
