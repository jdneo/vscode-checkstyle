// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

export interface ICheckstyleResult {
    line: number;
    column: number;
    message: string;
    severity: string;
    sourceName: string;
}

export interface ICheckstyleConfiguration {
    path: string;
    properties: object;
}
