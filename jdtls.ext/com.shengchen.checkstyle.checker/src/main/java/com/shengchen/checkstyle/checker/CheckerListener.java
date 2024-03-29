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

package com.shengchen.checkstyle.checker;

import com.puppycrawl.tools.checkstyle.api.AuditEvent;
import com.puppycrawl.tools.checkstyle.api.AuditListener;
import com.puppycrawl.tools.checkstyle.api.SeverityLevel;
import com.shengchen.checkstyle.runner.api.CheckResult;

import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CheckerListener implements AuditListener {

    private Map<String, List<CheckResult>> fileErrors = new HashMap<>();

    @Override
    public void addError(AuditEvent error) {
        final SeverityLevel severity = error.getSeverityLevel();
        if (severity.equals(SeverityLevel.IGNORE)) {
            return;
        }
        fileErrors.get(error.getFileName()).add(new CheckResult(
            error.getLine(),
            this.backCompatColumnIndex(error) + 1,
            error.getMessage(),
            severity.toString().toLowerCase(),
            error.getSourceName().substring(error.getSourceName().lastIndexOf('.') + 1)));
    }

    @Override
    public void fileStarted(AuditEvent event) {
        fileErrors.put(event.getFileName(), new ArrayList<>());
    }

    @Override
    public void fileFinished(AuditEvent arg0) {
        return;
    }

    @Override
    public void auditStarted(AuditEvent arg0) {
        return;
    }

    @Override
    public void auditFinished(AuditEvent arg0) {
        return;
    }

    @Override
    public void addException(AuditEvent arg0, Throwable arg1) {
        return;
    }

    public Map<String, List<CheckResult>> getResult(List<File> filesToCheck) {
        final Map<String, List<CheckResult>> result = new HashMap<>();
        for (final File file: filesToCheck) {
            final String fileName = file.getAbsolutePath();
            result.put(fileName, fileErrors.get(fileName));
        }
        return result;
    }

    private int backCompatColumnIndex(final AuditEvent error) {
        // To keep backwards compatibility:
        try {
            // Try to use LocalizedMessage for Checkstyle versions <= v8.41.1
            final Method getLocalizedMessage = error.getClass().getMethod("getLocalizedMessage");
            final Object localizedMessage = getLocalizedMessage.invoke(error);
            final Method getColumnCharIndex = localizedMessage.getClass().getMethod("getColumnCharIndex");

            return (int) getColumnCharIndex.invoke(localizedMessage);
        } catch (NoSuchMethodException |
            SecurityException |
            IllegalAccessException |
            IllegalArgumentException |
            InvocationTargetException e1
        ) {
            // If LocalizedMessage does not exist, Checkstyle version >= v8.42 is used
            return error.getViolation().getColumnCharIndex();
        }
    }
}
