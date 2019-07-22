package com.shengchen.checkstyle.runner.exceptions;

public enum CheckstyleResponseErrorCode {
    
    UnsupportedQuickfix(-39001);
    
    private final int value;
    
    CheckstyleResponseErrorCode(int value) {
        this.value = value;
    }
    
    public int getValue() {
        return value;
    }
}
