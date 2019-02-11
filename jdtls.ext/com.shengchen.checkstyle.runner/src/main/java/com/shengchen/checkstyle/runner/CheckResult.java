package com.shengchen.checkstyle.runner;

public class CheckResult {
    private int line;
    private int column;
    private String message;
    private String severity;
    private String sourceName;

    public CheckResult(int line, int column, String msg, String severity, String sourceName) {
        this.line = line;
        this.column = column;
        this.message = msg;
        this.severity = severity;
        this.sourceName = sourceName;
    }

    public int getLine() {
        return line;
    }

    public void setLine(int line) {
        this.line = line;
    }

    public int getColumn() {
        return column;
    }

    public void setColumn(int column) {
        this.column = column;
    }

    public String getMsg() {
        return message;
    }

    public void setMsg(String msg) {
        this.message = msg;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

}
