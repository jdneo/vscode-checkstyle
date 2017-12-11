'use strict';

export function parseOutput(output: string): IDiagnosticProblem[] {
    const regex: RegExp = /^(?:\[[A-Z]*?\] )?(.*\.java):(\d+)(?::([\w \-]+))?: (warning:|)(.+)/;
    const lines: string[] = output.split(/\r?\n/);
    const problems: IDiagnosticProblem[] = [];
    for (const line of lines) {
        const match: string[] = line.match(regex);
        if (match) {
            const [lineNum, colNum, , message] = match.slice(2, 6);
            problems.push({
                lineNum: Number(lineNum),
                colNum: colNum ? Number(colNum) : 0,
                problemType: 'warning',
                message: message
            });
        }
    }
    return problems;
}

export interface IDiagnosticProblem {
    lineNum: number;
    colNum: number;
    problemType: string;
    message: string;
}
