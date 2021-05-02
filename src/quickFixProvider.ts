// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as _ from 'lodash';
import { CodeAction, CodeActionContext, CodeActionKind, CodeActionProvider, Diagnostic, Range, Selection, TextDocument, window } from 'vscode';
import { checkstyleDiagnosticCollector } from './checkstyleDiagnosticCollector';
import { CheckstyleExtensionCommands } from './constants/commands';
import { ICheckstyleDiagnostic } from './models';
import { isQuickFixAvailable } from './utils/quickFixUtils';

class QuickFixProvider implements CodeActionProvider {
    public provideCodeActions(document: TextDocument, range: Range | Selection, context: CodeActionContext): CodeAction[] {
        const diagnosticsByCheck: IDiagnosticsByCheck = groupDiagnosticsByCheck(context.diagnostics);
        const codeActions: CodeAction[] = [];
        for (const check of Object.keys(diagnosticsByCheck)) {
            if (!isQuickFixAvailable(check)) {
                continue;
            }
            const diagnostics: Diagnostic[] = diagnosticsByCheck[check];
            codeActions.push(createFixAllDiagnostics(document, diagnostics, titleForDiagnostics(check, diagnostics), true));
        }

        /* Fix all in selection */
        const selection: Selection | undefined = window.activeTextEditor?.selection;
        if (codeActions.length > 1 && document.uri === window.activeTextEditor?.document?.uri &&
                selection && !selection.isEmpty && range.contains(selection)) {
            const diagnostics: Diagnostic[] = fixableDiagnostics(context.diagnostics);
            if (diagnostics.length) {
                codeActions.push(createFixAllDiagnostics(document, diagnostics, 'Fix all auto-fixable Checkstyle violations in selection', false));
            }
        }

        /* Fix all in document */
        const allDiagnostics: Diagnostic[] | undefined = checkstyleDiagnosticCollector.diagnostics(document.uri);
        if (allDiagnostics && allDiagnostics.length) {
            const diagnostics: Diagnostic[] = fixableDiagnostics(allDiagnostics);
            if (diagnostics.length) {
                codeActions.push(createFixAllDiagnostics(document, diagnostics, 'Fix all auto-fixable Checkstyle violations', false));
            }
        }
        return codeActions;
    }
}

interface IDiagnosticsByCheck {
    [check: string]: Diagnostic[];
}

function groupDiagnosticsByCheck(diagnostics: Diagnostic[]): IDiagnosticsByCheck {
    const result: IDiagnosticsByCheck = {};
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

function fixableDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
    return diagnostics.filter((diagnostic: Diagnostic) => isQuickFixAvailable(diagnostic.code));
}

function createFixAllDiagnostics(document: TextDocument, diagnostics: Diagnostic[], title: string, diagnosticSpecific: boolean): CodeAction {
    return {
        title,
        diagnostics: diagnosticSpecific ? diagnostics : undefined,
        command: {
            title: 'Fix the Checkstyle violation',
            command: CheckstyleExtensionCommands.FIX_CHECKSTYLE_VIOLATIONS,
            arguments: [
                document.uri,
                diagnostics.map((diagnostic: Diagnostic) => document.offsetAt(diagnostic.range.start)),
                diagnostics.map((diagnostic: Diagnostic) => diagnostic.code),
                diagnostics.map((diagnostic: ICheckstyleDiagnostic) => diagnostic.violationKey),
            ],
        },
        kind: CodeActionKind.QuickFix,
    };
}
