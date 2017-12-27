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

export interface IVersionInvalidParams {
    readonly uri: string;
}

export namespace VersionInvalidNotification {
    export const notificationType: NotificationType<IVersionInvalidParams, void> = new NotificationType<IVersionInvalidParams, void>('checkstyle/versioninvalid');
}

export namespace DownloadStartNotification {
    export const notificationType: NotificationType<void, void> = new NotificationType<void, void>('checkstyle/downloadstart');
}

export enum DownloadStatus {
    downloading = 1,
    finished = 2,
    error = 3
}

export namespace DownloadStatusNotification {
    export const notificationType: NotificationType<IDownloadParams, void> = new NotificationType<IDownloadParams, void>('checkstyle/downloadstatus');
}

interface IDownloadParams {
    readonly downloadStatus: DownloadStatus;
    readonly percent?: number;
    readonly error?: Error;
}
