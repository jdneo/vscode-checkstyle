// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as chokidar from 'chokidar';
import * as fse from 'fs-extra';
import fetch, { Response } from 'node-fetch';
import * as path from 'path';
import * as vscode from 'vscode';
import { checkstyleChannel } from './checkstyleChannel';
import { checkstyleDiagnosticCollector } from './checkstyleDiagnosticCollector';
import { checkstyleDiagnosticManager } from './checkstyleDiagnosticManager';
import { executeJavaLanguageServerCommand } from './commands/executeJavaLanguageServerCommand';
import { BuiltinConfiguration } from './constants/checkstyleConfigs';
import { CheckstyleServerCommands } from './constants/commands';
import { JAVA_CHECKSTYLE_CONFIGURATIONS, JAVA_CHECKSTYLE_VERSION } from './constants/settings';
import { ICheckstyleConfiguration } from './models';
import { handleErrors } from './utils/errorUtils';
import { getCheckstyleConfigurationPath, getCheckstyleExtensionModules, getCheckstyleProperties, getCheckstyleVersionString, getConfiguration, setCheckstyleVersionString } from './utils/settingUtils';

class CheckstyleConfigurationManager implements vscode.Disposable {

    private context: vscode.ExtensionContext;
    private config: ICheckstyleConfiguration;
    private configWatcher: chokidar.FSWatcher | undefined;
    private jarStorage: string;

    public async initialize(context: vscode.ExtensionContext): Promise<void> {
        this.context = context;
        await this.refresh();
    }

    public dispose(): void {
        if (this.configWatcher) {
            this.configWatcher.close();
        }
    }

    public get configUri(): vscode.Uri | undefined {
        if (!this.config.path) {
            return undefined;
        } else if (/^([c-zC-Z]:)?[/\\]/.test(this.config.path)) { // Starts with / or X:/ or X:\, where X is a Windows disk drive
            return vscode.Uri.file(this.config.path);
        } else {
            return vscode.Uri.parse(this.config.path);
        }
    }

    public get isConfigFromLocalFs(): boolean {
        return !!(this.configUri && this.configUri.scheme === 'file'
            && !(Object.values(BuiltinConfiguration) as string[]).includes(this.config.path));
    }

    public getBuiltinVersion(): string {
        return getConfiguration().inspect<string>(JAVA_CHECKSTYLE_VERSION)!.defaultValue!;
    }

    public async getCurrentVersion(): Promise<string | undefined> {
        try {
            return await executeJavaLanguageServerCommand<string | undefined>(CheckstyleServerCommands.GET_VERSION);
        } catch (error) {
            handleErrors(error);
            return undefined;
        }
    }

    public async getDownloadedVersions(): Promise<string[]> {
        const versions: string[] = [];
        for (const file of await fse.readdir(this.context.globalStoragePath)) {
            const match: RegExpMatchArray | null = file.match(/checkstyle-([\d.]+)-all\.jar/);
            if (match) {
                versions.push(match[1]);
            }
        }
        return versions;
    }

    public async fetchApiData<T = any>(api: string): Promise<T> {
        const apiFile: string = `${api.split('/').slice(-1)[0]}.json`;
        const apiPath: string = path.join(this.context.globalStoragePath, 'api', apiFile);
        const apiUrl: string = `https://api.github.com/repos/checkstyle/checkstyle${api}`;
        async function ensureLatestApiData(location: vscode.ProgressLocation): Promise<T> {
            return await vscode.window.withProgress({
                location, title: `Fetching Checkstyle metadata (${api})...`,
            }, async (_progress: vscode.Progress<{}>, _token: vscode.CancellationToken) => {
                const response: Response = await fetch(apiUrl, { timeout: 30000 });
                const apiData: T = await response.json();
                await fse.ensureFile(apiPath);
                await fse.writeJSON(apiPath, apiData);
                return apiData;
            });
        }
        if (await fse.pathExists(apiPath)) {
            const apiData: T = await fse.readJSON(apiPath); // Load the cached api data
            ensureLatestApiData(vscode.ProgressLocation.Window); // Fire and forget, update the latest data without user's notice
            return apiData;
        } else {
            return await ensureLatestApiData(vscode.ProgressLocation.Notification);
        }
    }

    public onDidChangeConfiguration(e: vscode.ConfigurationChangeEvent): void {
        if (JAVA_CHECKSTYLE_CONFIGURATIONS.some((setting: string) => e.affectsConfiguration(setting))) {
            this.refresh();
        }
    }

    private async refresh(): Promise<void> {
        this.config = {
            version: getCheckstyleVersionString(),
            path: getCheckstyleConfigurationPath(),
            properties: getCheckstyleProperties(),
            modules: getCheckstyleExtensionModules(),
        };
        if (this.config.version !== this.getBuiltinVersion()) {
            this.jarStorage = this.context.globalStoragePath;
        } else { // If equal to built-in version, directly use it
            this.jarStorage = path.join(this.context.extensionPath, 'server');
        }
        await this.ensureCheckstyleJarFile();
        await this.syncServer();
        if (this.configWatcher) {
            this.configWatcher.close();
            this.configWatcher = undefined;
        }
        if (this.isConfigFromLocalFs) {
            this.configWatcher = chokidar.watch(this.config.path, { ignoreInitial: true });
            this.configWatcher.on('all', (_event: string) => { this.syncServer(); });
        }
    }

    private async ensureCheckstyleJarFile(): Promise<void> {
        const version: string = this.config.version;
        const jarPath: string = path.join(this.jarStorage, `checkstyle-${version}-all.jar`);
        if (!await fse.pathExists(jarPath)) { // Ensure specified version downloaded on disk
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Downloading Checkstyle dependency for version ${version}...`,
                cancellable: true, // tslint:disable-next-line: typedef
            }, async (progress, token: vscode.CancellationToken) => {
                await fse.ensureDir(this.context.globalStoragePath);
                const response: Response = await fetch(`https://github.com/checkstyle/checkstyle/releases/download/checkstyle-${version}/checkstyle-${version}-all.jar`);
                const jarSize: number = Number(response.headers.get('content-length'));
                const jarBuffer: Buffer = Buffer.alloc(jarSize);
                let loadedSize: number = 0;
                for await (const result of response.body as NodeJS.ReadableStream & { [Symbol.asyncIterator](): AsyncIterator<Buffer> }) {
                    if (token.isCancellationRequested) {
                        const formerVersion: string = await this.getCurrentVersion() || this.getBuiltinVersion();
                        setCheckstyleVersionString(formerVersion); // Revert to version to before changing
                        this.config.version = formerVersion;
                        return; // Stop downloading progress
                    }
                    result.copy(jarBuffer, loadedSize, 0);
                    loadedSize += result.length;
                    progress.report({ increment: (result.length / jarSize) * 100 });
                }
                await fse.writeFile(jarPath, jarBuffer);
            });
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
            await executeJavaLanguageServerCommand(CheckstyleServerCommands.SET_CONFIGURATION, {
                jarStorage: this.jarStorage, ...this.config,
            });
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
