// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { ConfigurationTarget, Uri, window, workspace, WorkspaceConfiguration } from 'vscode';
import { JAVA_CHECKSTYLE_AUTOCHECK, JAVA_CHECKSTYLE_CONFIGURATION, JAVA_CHECKSTYLE_MODULES, JAVA_CHECKSTYLE_PROPERTIES, JAVA_CHECKSTYLE_VERSION } from '../constants/settings';
import { resolveVariables } from './workspaceUtils';

export function setCheckstyleConfigurationPath(fsPath: string, uri?: Uri): void {
  setConfiguration(JAVA_CHECKSTYLE_CONFIGURATION, fsPath, uri);
}

export function getCheckstyleConfigurationPath(uri?: Uri): string {
  const configurationPath: string = getConfiguration(uri).get<string>(JAVA_CHECKSTYLE_CONFIGURATION, '');
  return resolveVariables(configurationPath, uri);
}

export function setCheckstyleVersionString(version: string, uri?: Uri): void {
  setConfiguration(JAVA_CHECKSTYLE_VERSION, version, uri);
}

export function getCheckstyleVersionString(uri?: Uri): string {
  const version: string = getConfiguration(uri).get<string>(JAVA_CHECKSTYLE_VERSION)!;
  return resolveVariables(version, uri);
}

export function getCheckstyleExtensionModules(uri?: Uri): string[] {
  const modules: string[] = getConfiguration(uri).get<string[]>(JAVA_CHECKSTYLE_MODULES)!;
  return modules.map((mod: string) => resolveVariables(mod, uri));
}

export function getCheckstyleProperties(uri?: Uri): object {
  const properties: {} = getConfiguration(uri).get(JAVA_CHECKSTYLE_PROPERTIES, {});
  for (const key of Object.keys(properties)) {
    properties[key] = resolveVariables(resolveVariables(properties[key], uri), uri);
  }
  return properties;
}

export function isAutoCheckEnabled(): boolean {
  return getConfiguration().get<boolean>(JAVA_CHECKSTYLE_AUTOCHECK, true);
}

export function getConfiguration(uri?: Uri): WorkspaceConfiguration {
  return workspace.getConfiguration(undefined, uri || null);
}

function setConfiguration(section: string, value: any, uri?: Uri): void {
  if (!uri && window.activeTextEditor) {
    uri = window.activeTextEditor.document.uri;
  }
  getConfiguration(uri).update(section, value, ConfigurationTarget.WorkspaceFolder);
}
