// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { ConfigurationChangeEvent, ExtensionContext, FileSystemWatcher, languages, Uri, workspace } from 'vscode';
import { dispose as disposeTelemetryWrapper, initializeFromJsonFile, instrumentOperation, instrumentOperationAsVsCodeCommand } from 'vscode-extension-telemetry-wrapper';
import { checkstyleChannel } from './checkstyleChannel';
import { checkstyleConfigurationManager } from './checkstyleConfigurationManager';
import { checkstyleDiagnosticCollector } from './checkstyleDiagnosticCollector';
import { checkstyleDiagnosticManager } from './checkstyleDiagnosticManager';
import { checkstyleStatusBar } from './checkstyleStatusBar';
import { checkCode } from './commands/check';
import { setConfiguration } from './commands/config';
import { fixCheckstyleViolation } from './commands/fix';
import { setVersion } from './commands/version';
import { CheckstyleExtensionCommands } from './constants/commands';
import { quickFixProvider } from './quickFixProvider';

export async function activate(context: ExtensionContext): Promise<void> {
    await initializeFromJsonFile(context.asAbsolutePath('./package.json'));
    await instrumentOperation('activation', doActivate)(context);
}

export async function deactivate(): Promise<void> {
    await disposeTelemetryWrapper();
}

async function doActivate(_operationId: string, context: ExtensionContext): Promise<void> {
    checkstyleDiagnosticManager.initialize(context);
    checkstyleConfigurationManager.initialize(context);

    workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
        checkstyleDiagnosticManager.onDidChangeConfiguration(e);
        checkstyleConfigurationManager.onDidChangeConfiguration(e);
    });

    const codeWatcher: FileSystemWatcher = workspace.createFileSystemWatcher('**/*.{[jJ][aA][vV][aA]}', true /* ignoreCreateEvents */);
    codeWatcher.onDidDelete((uri: Uri) => {
        checkstyleDiagnosticCollector.delete(uri);
    }, null, context.subscriptions);

    context.subscriptions.push(
        checkstyleChannel,
        checkstyleStatusBar,
        checkstyleDiagnosticManager,
        checkstyleConfigurationManager,
        codeWatcher,
        languages.registerCodeActionsProvider({ scheme: 'file', language: 'java' }, quickFixProvider),
        instrumentOperationAsVsCodeCommand(CheckstyleExtensionCommands.OPEN_OUTPUT_CHANNEL, () => checkstyleChannel.show()),
        instrumentOperationAsVsCodeCommand(CheckstyleExtensionCommands.SET_CHECKSTYLE_CONFIGURATION, async (uri?: Uri) => await setConfiguration(uri)),
        instrumentOperationAsVsCodeCommand(CheckstyleExtensionCommands.SET_CHECKSTYLE_VERSION, async (version?: string) => await setVersion(version)),
        instrumentOperationAsVsCodeCommand(CheckstyleExtensionCommands.CHECK_CODE_WITH_CHECKSTYLE, async (uri?: Uri) => await checkCode(uri)),
        instrumentOperationAsVsCodeCommand(CheckstyleExtensionCommands.FIX_CHECKSTYLE_VIOLATION, async (uri: Uri, offset: number, sourceName: string) => await fixCheckstyleViolation(uri, offset, sourceName)),
    );
}
