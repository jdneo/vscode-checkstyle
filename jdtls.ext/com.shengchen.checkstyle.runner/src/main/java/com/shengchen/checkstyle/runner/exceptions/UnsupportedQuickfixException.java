package com.shengchen.checkstyle.runner.exceptions;

public class UnsupportedQuickfixException extends CheckstyleResponseErrorException {

    public UnsupportedQuickfixException(String sourceName) {
        super(CheckstyleResponseErrorCode.UnsupportedQuickfix, sourceName);
    }

}
