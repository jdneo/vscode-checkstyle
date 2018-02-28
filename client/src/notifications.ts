'use strict';

import { NotificationType } from 'vscode-languageclient';

export enum CheckStatus {
    success,
    fail,
    exception,
    wait
}

export interface ICheckStatusParams {
    uri: string;
    state: CheckStatus;
}

export namespace CheckStatusNotification {
    export const notificationType: NotificationType<ICheckStatusParams, void> = new NotificationType<ICheckStatusParams, void>('checkstyle/status');
}

export enum ServerStatus {
    downloading,
    running,
    stopped
}

export namespace ServerStatusNotification {
    export const notificationType: NotificationType<IServerStatusParams, void> = new NotificationType<IServerStatusParams, void>('checkstyle/serverstatus');
}

export interface IServerStatusParams {
    readonly status: ServerStatus;
}

export interface IVersionCheckParams {
    readonly uri: string;
    readonly result: VersionCheckResult;
}

export enum VersionCheckResult {
    found,
    invalid,
    exception
}

export namespace VersionCheckNotification {
    export const notificationType: NotificationType<IVersionCheckParams, void> = new NotificationType<IVersionCheckParams, void>('checkstyle/versioncheck');
}

export namespace DownloadStartNotification {
    export const notificationType: NotificationType<void, void> = new NotificationType<void, void>('checkstyle/downloadstart');
}

export enum DownloadStatus {
    downloading,
    finished,
    error
}

export namespace DownloadStatusNotification {
    export const notificationType: NotificationType<IDownloadParams, void> = new NotificationType<IDownloadParams, void>('checkstyle/downloadstatus');
}

export interface IDownloadParams {
    readonly downloadStatus: DownloadStatus;
    readonly percent?: number;
    readonly error?: Error;
    readonly downloadLink?: string;
}

export namespace ErrorNotification {
    export const notificationType: NotificationType<IErrorParams, void> = new NotificationType<IErrorParams, void>('checkstyle/error');
}

export interface IErrorParams {
    readonly uri: string;
    readonly errorMessage: string;
}
