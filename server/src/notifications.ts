'use strict';

import { NotificationType } from 'vscode-languageserver';

export enum CheckStatus {
    ok = 1,
    warn = 2
}

interface ICheckStatusParams {
    uri: string;
    state: CheckStatus;
}

export namespace CheckStatusNotification {
    export const notificationType: NotificationType<ICheckStatusParams, void> = new NotificationType<ICheckStatusParams, void>('checkstyle/status');
}

export enum ServerStatus {
    Downloading = 1,
    Running = 2,
    Stopped = 3
}

export namespace ServerStatusNotification {
    export const notificationType: NotificationType<IServerStatusParams, void> = new NotificationType<IServerStatusParams, void>('checkstyle/serverstatus');
}

interface IServerStatusParams {
    readonly status: ServerStatus;
}
