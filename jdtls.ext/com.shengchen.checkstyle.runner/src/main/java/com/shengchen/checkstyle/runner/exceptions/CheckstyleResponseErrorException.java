package com.shengchen.checkstyle.runner.exceptions;

import org.eclipse.lsp4j.jsonrpc.ResponseErrorException;
import org.eclipse.lsp4j.jsonrpc.messages.ResponseError;

public class CheckstyleResponseErrorException extends ResponseErrorException {

    public CheckstyleResponseErrorException(CheckstyleResponseErrorCode code, String message) {
        super(new ResponseError(code.getValue(), message, null));
    }

}
