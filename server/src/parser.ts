'use strict';

import * as parse from 'xml-parser';

export async function parseOutput(output: string): Promise<ICheckProblem[]> {
    const escapedOutput: string = output.replace(/&apos;/g, '\'')
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
    const report: parse.Document = parse(escapedOutput);
    const children: parse.Node[] = report.root.children;
    const problems: ICheckProblem[] = [];
    for (const node of children) {
        if (node.name === 'file') {
            for (const issue of node.children) {
                problems.push({
                    lineNum: Number(issue.attributes.line),
                    colNum: issue.attributes.column ? Number(issue.attributes.column) : 0,
                    problemType: issue.name,
                    message: issue.attributes.message
                });
            }
        }
    }
    return problems;
}

export interface ICheckProblem {
    lineNum: number;
    colNum: number;
    problemType: string;
    message: string;
}
