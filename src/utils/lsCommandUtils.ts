import { commands, Uri } from 'vscode';
import { CheckstyleExtensionCommands, JavaLanguageServerCommands } from '../constants/commands';
import { ICheckstyleResult } from '../models';

export async function checkstyle(filesToCheck: Uri[], configurationFilePath: string): Promise<void> {
    const results: ICheckstyleResult[] | undefined = await executeJavaLanguageServerCommand<ICheckstyleResult[]>(
        CheckstyleExtensionCommands.CHECK_CODE_WITH_CHECKSTYLE, filesToCheck, configurationFilePath);
    if (!results) {
        // TODO: log
        return;
    }
}

function executeJavaLanguageServerCommand<T>(...args: any[]): Thenable<T | undefined> {
    return commands.executeCommand<T>(JavaLanguageServerCommands.EXECUTE_WORKSPACE_COMMAND, ...args);
}
