// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { ConfigurationChangeEvent, ExtensionContext, FileSystemWatcher, languages, Uri, workspace } from 'vscode';
import { dispose as disposeTelemetryWrapper, initializeFromJsonFile, instrumentOperation, instrumentOperationAsVsCodeCommand } from 'vscode-extension-telemetry-wrapper';
import { checkstyleChannel } from './checkstyleChannel';
import { checkstyleDiagnosticCollector } from './checkstyleDiagnosticCollector';
import { checkstyleDiagnosticManager } from './checkstyleDiagnosticManager';
import { checkstyleStatusBar } from './checkstyleStatusBar';
import { checkCode } from './commands/check';
import { fixCheckstyleViolation } from './commands/fix';
import { setCheckstyleConfiguration, setServerConfiguration } from './commands/setCheckstyleConfiguration';
import { BuiltinConfiguration } from './constants/BuiltinConfiguration';
import { CheckstyleExtensionCommands } from './constants/commands';
import { quickFixProvider } from './quickFixProvider';
import { getCheckstyleConfigurationUri, isAutoCheckEnabled } from './utils/settingUtils';

export async function activate(context: ExtensionContext): Promise<void> {
    await initializeFromJsonFile(context.asAbsolutePath('./package.json'));
    await instrumentOperation('activation', doActivate)(context);
}

export async function deactivate(): Promise<void> {
    await disposeTelemetryWrapper();
}

async function doActivate(_operationId: string, context: ExtensionContext): Promise<void> {
    checkstyleDiagnosticManager.initialize(context);

    const codeWatcher: FileSystemWatcher = workspace.createFileSystemWatcher('**/*.{[jJ][aA][vV][aA]}', true /* ignoreCreateEvents */);
    codeWatcher.onDidDelete((uri: Uri) => {
        checkstyleDiagnosticCollector.delete(uri);
    }, null, context.subscriptions);

    let configWatcher: FileSystemWatcher | undefined;
    async function refreshConfiguraiton(): Promise<void> {
        await setServerConfiguration();
        if (configWatcher) {
            configWatcher.dispose();
            configWatcher = undefined;
        }
        const configUri: Uri = getCheckstyleConfigurationUri();
        if (configUri.scheme === 'file' && !Object.values(BuiltinConfiguration).includes(configUri.fsPath)) {
            configWatcher = workspace.createFileSystemWatcher(configUri.fsPath);
            configWatcher.onDidCreate((_uri: Uri) => setServerConfiguration());
            configWatcher.onDidChange((_uri: Uri) => setServerConfiguration());
            configWatcher.onDidDelete((_uri: Uri) => setServerConfiguration());
            context.subscriptions.push(configWatcher);
        }
    }
    await refreshConfiguraiton();

    workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
        if (e.affectsConfiguration('java.checkstyle.configuration')) {
            refreshConfiguraiton();
        }
        if (e.affectsConfiguration('java.checkstyle.properties')) {
            setServerConfiguration();
        }
        if (e.affectsConfiguration('java.checkstyle.autocheck')) {
            if (isAutoCheckEnabled()) {
                checkstyleDiagnosticManager.startListening();
            } else {
                checkstyleDiagnosticManager.stopListening();
            }
        }
    }, null, context.subscriptions);

    context.subscriptions.push(
        checkstyleChannel,
        checkstyleStatusBar,
        checkstyleDiagnosticManager,
        codeWatcher,
        languages.registerCodeActionsProvider({ scheme: 'file', language: 'java' }, quickFixProvider),
        instrumentOperationAsVsCodeCommand(CheckstyleExtensionCommands.OPEN_OUTPUT_CHANNEL, () => checkstyleChannel.show()),
        instrumentOperationAsVsCodeCommand(CheckstyleExtensionCommands.SET_CHECKSTYLE_CONFIGURATION, async (uri?: Uri) => await setCheckstyleConfiguration(uri)),
        instrumentOperationAsVsCodeCommand(CheckstyleExtensionCommands.CHECK_CODE_WITH_CHECKSTYLE, async (uri?: Uri) => await checkCode(uri)),
        instrumentOperationAsVsCodeCommand(CheckstyleExtensionCommands.FIX_CHECKSTYLE_VIOLATION, async (uri: Uri, offset: number, sourceName: string) => await fixCheckstyleViolation(uri, offset, sourceName)),
    );
}
