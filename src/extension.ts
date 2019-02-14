// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { ExtensionContext, languages, TextDocument, TextEditor, Uri, window, workspace } from 'vscode';
import { dispose as disposeTelemetryWrapper, initializeFromJsonFile, instrumentOperation, instrumentOperationAsVsCodeCommand } from 'vscode-extension-telemetry-wrapper';
import { checkstyleChannel } from './checkstyleChannel';
import { checkstyle } from './commands/check';
import { fixCheckstyleViolation } from './commands/fix';
import { setCheckstyleConfiguration } from './commands/setCheckstyleConfiguration';
import { CheckstyleExtensionCommands } from './constants/commands';
import { quickFixProvider } from './quickFixProvider';
import { isAutoCheckEnabled } from './utils/settingUtils';

export async function activate(context: ExtensionContext): Promise<void> {
    await initializeFromJsonFile(context.asAbsolutePath('./package.json'), true);
    await instrumentOperation('activation', doActivate)(context);

    workspace.onDidSaveTextDocument((doc: TextDocument) => {
        if (isAutoCheckEnabled()) {
            checkstyle(doc.uri);
        }
    }, null, context.subscriptions);

    window.onDidChangeActiveTextEditor((editor: TextEditor | undefined) => {
        if (editor && isAutoCheckEnabled()) {
            checkstyle(editor.document.uri);
        }
    }, null, context.subscriptions);

    if (isAutoCheckEnabled()) {
        checkstyle();
    }
}

export async function deactivate(): Promise<void> {
    await disposeTelemetryWrapper();
}

async function doActivate(_operationId: string, context: ExtensionContext): Promise<void> {
    context.subscriptions.push(
        checkstyleChannel,
        languages.registerCodeActionsProvider({ scheme: 'file', language: 'java' }, quickFixProvider),
        instrumentOperationAsVsCodeCommand(CheckstyleExtensionCommands.SET_CHECKSTYLE_CONFIGURATION, async (uri?: Uri) => await setCheckstyleConfiguration(uri)),
        instrumentOperationAsVsCodeCommand(CheckstyleExtensionCommands.CHECK_CODE_WITH_CHECKSTYLE, async (uri?: Uri) => await checkstyle(uri)),
        instrumentOperationAsVsCodeCommand(CheckstyleExtensionCommands.FIX_CHECKSTYLE_VIOLATION, async (uri: Uri, offset: number, sourceName: string) => await fixCheckstyleViolation(uri, offset, sourceName)),
    );
}
