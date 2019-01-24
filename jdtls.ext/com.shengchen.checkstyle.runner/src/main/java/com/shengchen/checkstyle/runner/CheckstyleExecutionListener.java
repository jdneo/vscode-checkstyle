package com.shengchen.checkstyle.runner;

import com.puppycrawl.tools.checkstyle.api.AuditEvent;
import com.puppycrawl.tools.checkstyle.api.AuditListener;
import com.puppycrawl.tools.checkstyle.api.SeverityLevel;

import java.util.LinkedList;
import java.util.List;

public class CheckstyleExecutionListener implements AuditListener {

    private List<CheckResult> result = new LinkedList<>();

    @Override
    public void addError(AuditEvent error) {
        final SeverityLevel severity = error.getSeverityLevel();
        if (severity.equals(SeverityLevel.IGNORE)) {
            return;
        }
        result.add(new CheckResult(error.getLine(), error.getColumn(), error.getMessage(), severity.toString()));
    }

    @Override
    public void addException(AuditEvent arg0, Throwable arg1) {
        return;

    }

    @Override
    public void auditFinished(AuditEvent arg0) {
        return;
    }

    @Override
    public void auditStarted(AuditEvent arg0) {
        return;
    }

    @Override
    public void fileFinished(AuditEvent arg0) {
        return;
    }

    @Override
    public void fileStarted(AuditEvent arg0) {
        return;
    }

    public List<CheckResult> getResult() {
        return this.result;
    }
}
