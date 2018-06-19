'use strict';

export class InvalidVersionError extends Error { }

export class VersionNotExistError extends Error {

    private _version: string;

    constructor(version: string) {
        super();
        this._version = version;
    }

    get version(): string {
        return this._version;
    }
}

export class DownloadCheckstyleError extends Error {
    public message: string;

    constructor(message: string) {
        super();
        this.message = message;
    }
}

export function getErrorMessage(err: Error): string {
    let errorMessage: string = 'unknown error';
    if (typeof err.message === 'string') {
        errorMessage = <string>err.message;
    } else {
        errorMessage = err.toString();
    }
    return `Checkstyle Error: - '${errorMessage}'`;
}
