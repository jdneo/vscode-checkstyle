// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { CodeAction, CodeActionContext, CodeActionKind, CodeActionProvider, Range, Selection, TextDocument } from 'vscode';
import { CheckstyleExtensionCommands } from './constants/commands';
import { isQuickFixAvailable } from './utils/quickFixUtils';

class QuickFixProvider implements CodeActionProvider {
    public provideCodeActions(document: TextDocument, _range: Range | Selection, context: CodeActionContext): CodeAction[] {
        const codeActions: CodeAction[] = [];
        for (const diagnostic of context.diagnostics) {
            if (!isQuickFixAvailable(diagnostic.code)) {
                continue;
            }
            codeActions.push({
                title: `Fix '${diagnostic.message}'`,
                diagnostics: [diagnostic],
                command: {
                    title: 'Fix the Checkstyle violation',
                    command: CheckstyleExtensionCommands.FIX_CHECKSTYLE_VIOLATION,
                    arguments: [document.uri, document.offsetAt(diagnostic.range.start), diagnostic.code],
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
                title: `Fix ${offsets.length} Checkstyle violations`,
                command: {
                    title: 'Fix the Checkstyle violation',
                    command: CheckstyleExtensionCommands.FIX_ALL_CHECKSTYLE_VIOLATIONS,
                    arguments: [document.uri, offsets, diagnosticCodes],
                },
                kind: CodeActionKind.QuickFix,
            });
        }
        return codeActions;
    }
}

export const quickFixProvider: QuickFixProvider = new QuickFixProvider();
