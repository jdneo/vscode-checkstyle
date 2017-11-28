'use strict';

import * as xml2js from 'xml2js';

export async function parseOutput(output: string): Promise<IDiagnosticProblem[]> {
    const escapedOutput: string = output.replace(/&apos;/g, '\'')
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
    return await new Promise((resolve: (problems: IDiagnosticProblem[]) => void, reject: (e: Error) => void): void => {
        // tslint:disable-next-line:no-any
        xml2js.parseString(escapedOutput, {explicitArray: false}, (err: any, result: any): void => {
            if (err) {
                reject(err);
            } else {
                // tslint:disable-next-line:no-string-literal no-unsafe-any
                if (result && result['checkstyle'] && result['checkstyle']['file'] && result['checkstyle']['file']['error']) {
                    // tslint:disable-next-line:no-string-literal
                    const errors: ICheckStyleError[] = result['checkstyle']['file']['error'];
                    const problems: IDiagnosticProblem[] = [];
                    for (const error of errors) {
                        problems.push({
                            lineNum: Number(error.$.line),
                            colNum: error.$.column ? Number(error.$.column) : 0,
                            problemType: error.$.servity,
                            message: error.$.message
                        });
                    }
                    resolve(problems);
                } else {
                    reject(new Error('Cannot parse the output xml from checkstyle.'));
                }
            }
        });
    });
}

export interface IDiagnosticProblem {
    lineNum: number;
    colNum: number;
    problemType: string;
    message: string;
}

interface ICheckStyleError {
    $: {
        line: string;
        column: string;
        message: string;
        servity: string;
        source: string;
    };
}
