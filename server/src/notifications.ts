'use strict';

import { NotificationType } from 'vscode-languageserver';

export enum Status {
    ok = 1,
    warn = 2
}

interface IStatusParams {
    uri: string;
    state: Status;
}

export namespace StatusNotification {
    export const notificationType: NotificationType<IStatusParams, void> = new NotificationType<IStatusParams, void>('checkstyle/status');
}
