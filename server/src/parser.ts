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
                const [rowNum, , , message] = match.slice(2, 6);
                let row: number = Number(rowNum);
                row = row - 1 < 0 ? 0 : row - 1;
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: { line: row, character: 0 },
                        end: { line: row, character: Number.MAX_VALUE }
                    },
                    message: message,
                    source: 'Checkstyle'
                });
            }
        }
        return diagnostics;
    }
}
