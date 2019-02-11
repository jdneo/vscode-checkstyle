/*
 * Copyright (C) jdneo

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
        final String sourceName = error.getSourceName().substring(error.getSourceName().lastIndexOf('.') + 1);
        result.add(new CheckResult(error.getLine(), error.getColumn(), error.getMessage(), severity.toString(),
                sourceName));
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
