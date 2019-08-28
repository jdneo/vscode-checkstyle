import * as chokidar from 'chokidar';
import * as vscode from 'vscode';
import { checkstyleChannel } from './checkstyleChannel';
import { checkstyleDiagnosticCollector } from './checkstyleDiagnosticCollector';
import { checkstyleDiagnosticManager } from './checkstyleDiagnosticManager';
import { executeJavaLanguageServerCommand } from './commands/executeJavaLanguageServerCommand';
import { BuiltinConfiguration } from './constants/checkstyleConfigs';
import { CheckstyleServerCommands } from './constants/commands';
import { ICheckstyleConfiguration } from './models';
import { handleErrors } from './utils/errorUtils';
import { getCheckstyleConfigurationPath, getCheckstyleProperties } from './utils/settingUtils';

class CheckstyleConfigurationManager implements vscode.Disposable {

    private config: ICheckstyleConfiguration;
    private configWatcher: chokidar.FSWatcher | undefined;

    public initialize(context: vscode.ExtensionContext): void {
        vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration, this, context.subscriptions);
        this.refresh();
    }

    public dispose(): void {
        if (this.configWatcher) {
            this.configWatcher.close();
        }
    }

    public get configUri(): vscode.Uri {
        // Starts with / or X:/ or X:\, where X is a Windows disk drive
        if (/^([c-zC-Z]:)?[/\\]/.test(this.config.path)) {
            return vscode.Uri.file(this.config.path);
        } else {
            return vscode.Uri.parse(this.config.path);
        }
    }

    private onDidChangeConfiguration(e: vscode.ConfigurationChangeEvent): void {
        if (e.affectsConfiguration('java.checkstyle.configuration') ||
            e.affectsConfiguration('java.checkstyle.properties')) {
            this.refresh();
        }
    }

    private async refresh(): Promise<void> {
        this.config = {
            path: getCheckstyleConfigurationPath(),
            properties: getCheckstyleProperties(),
        };
        await this.syncServer();
        if (this.configWatcher) {
            this.configWatcher.close();
            this.configWatcher = undefined;
        }
        if (this.configUri.scheme === 'file' && !Object.values(BuiltinConfiguration).includes(this.config.path)) {
            this.configWatcher = chokidar.watch(this.config.path);
            this.configWatcher.on('all', (_event: string) => { this.syncServer(); });
        }
    }

    private async syncServer(): Promise<void> {
        if (!this.config.path) {
            checkstyleChannel.appendLine('Checkstyle configuration file not set yet, skip the check.');
            checkstyleDiagnosticManager.dispose();
            checkstyleDiagnosticCollector.clear();
            return;
        }
        try {
            await executeJavaLanguageServerCommand(CheckstyleServerCommands.SET_CONFIGURATION,
                this.config.path, this.config.properties,
            );
            checkstyleDiagnosticManager.activate();
            checkstyleDiagnosticManager.getDiagnostics(checkstyleDiagnosticCollector.getResourceUris());
        } catch (error) {
            handleErrors(error);
            checkstyleDiagnosticManager.dispose();
            checkstyleDiagnosticCollector.clear();
        }
    }
}

export const checkstyleConfigurationManager: CheckstyleConfigurationManager = new CheckstyleConfigurationManager();
