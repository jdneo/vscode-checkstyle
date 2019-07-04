// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { window } from 'vscode';
import { ErrorCodes, ResponseError } from 'vscode-languageserver-protocol';
import { checkstyleChannel } from '../checkstyleChannel';
import { checkstyleStatusBar } from '../checkstyleStatusBar';

export enum CheckstyleErrorCodes {
    UnsupportedQuickfix = -39001,
}

export async function handleErrors(error: Error): Promise<void> {
    if ('code' in error && 'data' in error) {
        handleResponseErrors(error as ResponseError<any>);
    } else {
        checkstyleChannel.appendLine(`[Extension Error] ${error}`);
    }
    checkstyleStatusBar.showError();
}

async function handleResponseErrors(error: ResponseError<any>): Promise<void> {
    switch (error.code) {
        case CheckstyleErrorCodes.UnsupportedQuickfix:
            checkstyleChannel.appendLine(`[Checkstyle Error] Unsupported quickfix: ${error.message}`);
            break;
        case ErrorCodes.InvalidRequest:
            checkstyleChannel.appendLine(`[Checkstyle Error] ${error.message}`);
            window.showErrorMessage(`Checkstyle: ${error.message}`);
            break;
        case ErrorCodes.MethodNotFound:
            checkstyleChannel.appendLine(`[Command Error] Invalid command: ${error.message}`);
            break;
        case ErrorCodes.InvalidParams:
            checkstyleChannel.appendLine(`[Command Error] Invalid command arguments: ${JSON.stringify({
                message: error.message,
                arguments: JSON.stringify(error.data),
            }, undefined, 2)}`);
            break;
        case ErrorCodes.InternalError:
        case ErrorCodes.UnknownErrorCode:
        default:
            checkstyleChannel.appendLine(`[Server Error] ${error.message}\n${JSON.stringify(error.data, undefined, 2)}`);
            window.showErrorMessage('Internal server error occured, please open output channel for detail.');
    }
}
