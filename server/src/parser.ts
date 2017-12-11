'use strict';

import {
    Diagnostic,
    DiagnosticSeverity
} from 'vscode-languageserver';

export namespace parser {
    export function parseOutput(output: string): Diagnostic[] {
        const regex: RegExp = /^(?:\[[A-Z]*?\] )?(.*\.java):(\d+)(?::([\w \-]+))?: (warning:|)(.+)/;
        const lines: string[] = output.split(/\r?\n/);
        const diagnostics: Diagnostic[] = [];
        for (const line of lines) {
            const match: string[] = line.match(regex);
            if (match) {
                const [rowNum, colNum, , message] = match.slice(2, 6);
                const row: number = Number(rowNum);
                const column: number = isNaN(Number(colNum)) ? 1 : Number(colNum);
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: { line: row - 1, character: colNum ? column - 1 : 0 },
                        end: { line: row - 1, character: colNum ? column : Number.MAX_VALUE }
                    },
                    message: message,
                    source: 'Checkstyle'
                });
            }
        }
        return diagnostics;
    }
}
