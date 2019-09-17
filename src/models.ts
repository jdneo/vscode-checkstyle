// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.
import { QuickPickItem } from 'vscode';

export interface IQuickPickItemEx<T = string> extends QuickPickItem {
    value?: T;
}

export interface ICheckstyleResult {
    line: number;
    column: number;
    message: string;
    severity: 'ignore' | 'info' | 'warning' | 'error';
    sourceName: string;
}

export interface ICheckstyleConfiguration {
    version: string;
    path: string;
    properties: object;
}
