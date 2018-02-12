'use strict';

import { MessageItem } from 'vscode';

export namespace DialogResponses {
    export const yes: MessageItem = { title: 'Yes' };
    export const openDownloadPage: MessageItem = { title: 'Open download page' };
    export const cancel: MessageItem = { title: 'Cancel', isCloseAffordance: true };
    export const never: MessageItem = { title: 'Never' };
}
