// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

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
            if (diagnostics.length === 1) {
                const diagnostic: Diagnostic = diagnostics[0];
                codeActions.push({
                    title: `Fix '${diagnostic.message}'`,
                    diagnostics,
                    command: {
                        title: 'Fix the Checkstyle violation',
                        command: CheckstyleExtensionCommands.FIX_CHECKSTYLE_VIOLATIONS,
                        arguments: [document.uri, [document.offsetAt(diagnostic.range.start)], [diagnostic.code]],
                    },
                    kind: CodeActionKind.QuickFix,
                });
            } else {
                codeActions.push({
                    title: `Fix ${diagnostics.length} Checkstyle ${formatCode(code)} violations`,
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

function formatCode(str: string): string {
    if (str.endsWith('Check')) {
        str = str.substring(0, str.length - 'Check'.length);
    }

    let result: string = '';
    let previousIsUpperCase: boolean = false;
    for (const c of str) {
        if (c >= 'A' && c <= 'Z') {
            if (!previousIsUpperCase) {
                if (result.length > 0) {
                    result += ' ';
                }
                previousIsUpperCase = true;
            }
        } else {
            previousIsUpperCase = false;
        }
        result += c;
    }
    return result;
}
