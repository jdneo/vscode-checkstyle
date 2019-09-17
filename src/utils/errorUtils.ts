// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import * as vscode from 'vscode';
import { checkstyleChannel } from '../checkstyleChannel';
import { checkstyleConfigurationManager } from '../checkstyleConfigurationManager';
import { checkstyleStatusBar } from '../checkstyleStatusBar';
import { CheckstyleExtensionCommands } from '../constants/commands';

export async function handleErrors(error: Error): Promise<void> {
    if (error['data']) {
        checkstyleChannel.appendLine(JSON.stringify(error['data']));
    } else {
        checkstyleChannel.appendLine(error.stack || error.toString());
    }

    checkstyleStatusBar.showError();
}
