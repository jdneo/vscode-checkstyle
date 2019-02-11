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
        return codeActions;
    }
}

export const quickFixProvider: QuickFixProvider = new QuickFixProvider();
