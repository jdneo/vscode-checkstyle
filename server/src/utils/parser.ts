/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import parse = require('xml-parser');

export async function parseOutput(output: string): Promise<CheckProblem[]> {
    const escapedOutput: string = output.replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
    const report: parse.Document = parse(escapedOutput);
    const children: parse.Node[] = report.root.children;
    let fileName: string;
    const problems: CheckProblem[] = new Array();
    for (const node of children) {
        if (node.name == 'file') {
            fileName = node.attributes.name;
            for (const issue of node.children) {
                problems.push({
                    file: fileName,
                    lineNum: Number(issue.attributes.line),
                    colNum: issue.attributes.column ? Number(issue.attributes.column) : 0,
                    type: issue.name,
                    message: issue.attributes.message
                })
            }
        }
    }
    return problems;

    // cosnt RegExp: RegExp = new RegExp(/^\[\w+\]) (.*\.java):(\d+):(\d+)? (\w*) (\[\w+\])/)
}

export interface CheckProblem {
    file: string,
    lineNum: number,
    colNum: number,
    type: string,
    message: string
}

