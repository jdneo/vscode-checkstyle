// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { checkstyleChannel } from '../checkstyleChannel';
import { checkstyleStatusBar } from '../checkstyleStatusBar';

export async function handleErrors(error: Error): Promise<void> {
    if (error['data']) {
        checkstyleChannel.appendLine(JSON.stringify(error['data']));
    } else {
        checkstyleChannel.appendLine(error.stack || error.toString());
    }

    checkstyleStatusBar.showError();
}
