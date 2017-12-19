'use strict';

import { NotificationType } from 'vscode-languageclient';

export enum Status {
    ok = 1,
    warn = 2
}

export interface IStatusParams {
    uri: string;
    state: Status;
}

export namespace StatusNotification {
    export const notificationType: NotificationType<IStatusParams, void> = new NotificationType<IStatusParams, void>('checkstyle/status');
}
