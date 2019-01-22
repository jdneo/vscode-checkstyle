import { ConfigurationTarget, Uri, workspace, WorkspaceConfiguration } from 'vscode';
import { JAVA_CHECKSTYLE_CONFIGURATION } from '../constants/configs';

export function getCheckstyleConfigurationPath(uri?: Uri): string {
    return getConfiguration(uri).get<string>(JAVA_CHECKSTYLE_CONFIGURATION, '');
}

export function setCheckstyleConfigurationPath(fsPath: string, uri?: Uri): void {
    getConfiguration(uri).update(JAVA_CHECKSTYLE_CONFIGURATION, fsPath, ConfigurationTarget.WorkspaceFolder);
}

function getConfiguration(uri?: Uri): WorkspaceConfiguration {
    return workspace.getConfiguration(undefined, uri);
}
