'use strict';

import { RequestType, TextDocumentIdentifier } from 'vscode-languageserver';

export interface ICheckstyleParams {
    readonly textDocument: TextDocumentIdentifier;
}

export namespace CheckStyleRequest {
    export const requestType: RequestType<ICheckstyleParams, void, void, void> = new RequestType<ICheckstyleParams, void, void, void>('checkstyle/textDocument');
}

export interface IUpdateSettingParams {
    readonly uri: string;
}

export namespace UpdateSettingParamsRequest {
    export const requestType: RequestType<IUpdateSettingParams, void, void, void> = new RequestType<IUpdateSettingParams, void, void, void>('checkstyle/updateSetting');
}

export namespace DownloadStartRequest {
    export const requestType: RequestType<void, void, void, void> = new RequestType<void, void, void, void>('checkstyle/downloadstart');
}

export enum DownloadStatus {
    downloading = 1,
    finished = 2,
    error = 3
}

export namespace DownloadStatusRequest {
    export const requestType: RequestType<IDownloadParams, void, void, void> = new RequestType<IDownloadParams, void, void, void>('checkstyle/downloadstatus');
}

interface IDownloadParams {
    readonly downloadStatus: DownloadStatus;
    readonly percent?: number;
    readonly error?: Error;
}
