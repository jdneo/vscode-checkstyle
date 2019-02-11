// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { commands, Uri, window } from 'vscode';
import { checkstyleChannel } from '../checkstyleChannel';
import { VsCodeCommands } from '../constants/commands';

const OPEN: string = 'Open';
const REPORT_ISSUE: string = 'Report Issue';

export async function handleErrors(error: Error): Promise<void> {
    checkstyleChannel.appendLine(error.toString());
    const choice: string | undefined = await window.showErrorMessage('Unexpected exception occurred, please open the Checkstyle output channel for details.', OPEN, REPORT_ISSUE);
    if (!choice) {
        return;
    } else if (choice === OPEN) {
        checkstyleChannel.show();
    } else if (choice === REPORT_ISSUE) {
        commands.executeCommand(VsCodeCommands.OPEN, Uri.parse('https://aka.ms/vscode-checkstyle-issue'));
    }
}
