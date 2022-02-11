// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as _ from 'lodash';
import { window } from 'vscode';
import { checkstyleConfigurationManager } from '../checkstyleConfigurationManager';
import { IQuickPickItemEx } from '../models';
import { setCheckstyleVersionString } from '../utils/settingUtils';

export async function setVersion(version?: string): Promise<void> {
    version = version || await queryForVersion();
    if (!version) {
        return;
    }
    setCheckstyleVersionString(version);
}

async function queryForVersion(): Promise<string | undefined> {
    const result: IQuickPickItemEx | undefined = await window.showQuickPick([
        ...await getRecommendedVersions(),
        {
            label: '$(file-text) All supported versions...',
            detail: 'List all the Checkstyle versions supported by extension.',
            value: ':list',
        },
    ], { ignoreFocusOut: true });
    if (!result) {
        return undefined;
    } else if (result.value === ':list') {
        try {
            return await window.showQuickPick(await getAllSupportedVersions(), { ignoreFocusOut: true });
        } catch (error) {
            window.showQuickPick(['Network error']);
            return undefined;
        }
    } else {
        return result.value;
    }
}

async function getRecommendedVersions(): Promise<IQuickPickItemEx[]> {
    const versions: Map<string, string[]> = new Map(); // version -> description
    function setDescription(version: string, description: string): void {
        versions.set(version, [...(versions.get(version) || []), description]);
    }
    try { // Do not set latest version if there's network issue
        setDescription(await getLatestVersion(), 'latest version');
    } catch (error) { /* Skip */ }
    for (const version of await checkstyleConfigurationManager.getDownloadedVersions()) {
        setDescription(version, 'downloaded');
    }
    setDescription(checkstyleConfigurationManager.getBuiltinVersion(), 'built-in');
    const currentVersion: string | undefined = await checkstyleConfigurationManager.getCurrentVersion();
    return sortVersions([...versions.keys()]).map((version: string) => ({
        label: (version === currentVersion ? '$(check) ' : '') + version,
        description: versions.get(version)!.join(', '),
        value: version,
    }));
}

async function getLatestVersion(): Promise<string> {
    const { tag_name } = await checkstyleConfigurationManager.fetchApiData<{ tag_name: string }>('/releases/latest');
    return tag_name.match(/checkstyle-([\d.]+)/)![1];
}

async function getAllSupportedVersions(): Promise<string[]> {
    const tags: { ref: string }[] = await checkstyleConfigurationManager.fetchApiData('/git/refs/tags');
    const versions: string[] = [];
    for (const { ref } of tags) {
        const match: RegExpMatchArray | null = ref.match(/checkstyle-([\d.]+)/);
        if (match) {
            versions.push(match[1]);
        }
    }
    return sortVersions(versions);
}

function sortVersions(versions: string[]): string[] { // Sort versions in descending order (latest first)
    return versions.sort((a: string, b: string) => b.localeCompare(a, undefined, { numeric: true }));
}
