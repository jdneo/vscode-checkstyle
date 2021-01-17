// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as _ from 'lodash';
import { CodeAction, CodeActionContext, CodeActionKind, CodeActionProvider, Diagnostic, Range, Selection, TextDocument } from 'vscode';
import { CheckstyleExtensionCommands } from './constants/commands';
import { isQuickFixAvailable } from './utils/quickFixUtils';

class QuickFixProvider implements CodeActionProvider {
    public provideCodeActions(document: TextDocument, _range: Range | Selection, context: CodeActionContext): CodeAction[] {
        const diagnosticsByCode: IDiagnosticsByCode = groupIDiagnosticsByCode(context.diagnostics);
        const codeActions: CodeAction[] = [];
        for (const code of Object.keys(diagnosticsByCode)) {
            if (!isQuickFixAvailable(code)) {
                continue;
            }
            const diagnostics: Diagnostic[] = diagnosticsByCode[code];
            codeActions.push({
                title: titleForDiagnostics(code, diagnostics),
                diagnostics,
                command: {
                    title: 'Fix the Checkstyle violation',
                    command: CheckstyleExtensionCommands.FIX_CHECKSTYLE_VIOLATIONS,
                    arguments: [
                        document.uri,
                        diagnostics.map((diagnostic: Diagnostic) => document.offsetAt(diagnostic.range.start)),
                        diagnostics.map((diagnostic: Diagnostic) => diagnostic.code),
                    ],
                },
                kind: CodeActionKind.QuickFix,
            });
        }

        if (codeActions.length > 1) {
            /* Add fix all */
            const offsets: number[] = [];
            const diagnosticCodes: string[] = [];

            for (const diagnostic of context.diagnostics) {
                if (!isQuickFixAvailable(diagnostic.code)) {
                    continue;
                }

                if (typeof diagnostic.code === 'string') {
                    offsets.push(document.offsetAt(diagnostic.range.start));
                    diagnosticCodes.push(diagnostic.code);
                }
            }

            codeActions.push({
                title: `Fix all auto-fixable Checkstyle violations`,
                command: {
                    title: 'Fix the Checkstyle violation',
                    command: CheckstyleExtensionCommands.FIX_CHECKSTYLE_VIOLATIONS,
                    arguments: [document.uri, offsets, diagnosticCodes],
                },
                kind: CodeActionKind.QuickFix,
            });
        }
        return codeActions;
    }
}

interface IDiagnosticsByCode {
    [code: string]: Diagnostic[];
}

function groupIDiagnosticsByCode(diagnostics: Diagnostic[]): IDiagnosticsByCode {
    const result: IDiagnosticsByCode = {};
    for (const diagnostic of diagnostics) {
        if (typeof diagnostic.code !== 'string') {
            continue;
        }
        if (!result[diagnostic.code]) {
            result[diagnostic.code] = [];
        }
        result[diagnostic.code].push(diagnostic);
    }
    return result;
}

export const quickFixProvider: QuickFixProvider = new QuickFixProvider();

function formatCheckstyleCheck(str: string): string {
    if (str.endsWith('Check')) {
        str = str.substring(0, str.length - 'Check'.length);
    }

    return _.startCase(str);
}

/**
 * Return the quick fix title for a group of diagnostics from a given check.
 */
function titleForDiagnostics(check: string, diagnostics: Diagnostic[]): string {
    if (diagnostics.length === 1) {
        return `Fix '${diagnostics[0].message}'`;
    } else {
        return `Fix ${diagnostics.length} '${formatCheckstyleCheck(check)}' Checkstyle violations`;
    }
}
