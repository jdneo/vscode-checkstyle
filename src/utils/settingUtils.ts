import { ConfigurationTarget, Uri, workspace, WorkspaceConfiguration, WorkspaceFolder } from 'vscode';
import { JAVA_CHECKSTYLE_CONFIGURATION, JAVA_CHECKSTYLE_PROPERTIES } from '../constants/configs';

export function getCheckstyleConfigurationPath(uri: Uri): string {
    const configurationPath: string = getConfiguration(uri).get<string>(JAVA_CHECKSTYLE_CONFIGURATION, '');
    return resolveVariables(uri, configurationPath);
}

export function getCheckstyleProperties(uri: Uri): object {
    const properties: {} = workspace.getConfiguration(undefined, uri).get(JAVA_CHECKSTYLE_PROPERTIES, {});
    for (const key of Object.keys(properties)) {
        properties[key] = resolveVariables(uri, resolveVariables(uri, properties[key]));
    }
    return properties;
}

export function setCheckstyleConfigurationPath(fsPath: string, uri?: Uri): void {
    getConfiguration(uri).update(JAVA_CHECKSTYLE_CONFIGURATION, fsPath, ConfigurationTarget.WorkspaceFolder);
}

const workspaceRegexp: RegExp = /\$\{workspacefolder\}/i;
function resolveVariables(resourceUri: Uri, value: string): string {
    const workspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(resourceUri);
    if (!workspaceFolder) {
        return value;
    }
    if (workspaceRegexp.test(value)) {
        return value.replace(workspaceRegexp, workspaceFolder.uri.fsPath);
    }
    return value;
}

function getConfiguration(uri?: Uri): WorkspaceConfiguration {
    return workspace.getConfiguration(undefined, uri);
}
