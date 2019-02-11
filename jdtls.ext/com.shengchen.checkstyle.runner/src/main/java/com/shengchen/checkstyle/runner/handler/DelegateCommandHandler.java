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

package com.shengchen.checkstyle.runner.handler;

import com.shengchen.checkstyle.runner.CheckstyleRunner;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.jdt.ls.core.internal.IDelegateCommandHandler;

import java.util.List;

@SuppressWarnings("restriction")
public class DelegateCommandHandler implements IDelegateCommandHandler {

    private static final String CHECK_CODE_WITH_CHECKSTYLE = "java.checkstyle.checkcode";
    private static final String FIX_CHECKSTYLE_VIOLATION = "java.checkstyle.quickfix";
    private static final String VALIDATE_CHECKSTYLE_CONFIGURATION = "java.checkstyle.validate.configuration";

    @Override
    public Object executeCommand(String commandId, List<Object> arguments, IProgressMonitor monitor) throws Exception {
        switch (commandId) {
            case CHECK_CODE_WITH_CHECKSTYLE:
                return CheckstyleRunner.check(arguments);
            case FIX_CHECKSTYLE_VIOLATION:
                return CheckstyleRunner.quickFix(arguments);
            case VALIDATE_CHECKSTYLE_CONFIGURATION:
                return CheckstyleRunner.validateConfigurationFile(arguments);
            default:
                return null;
        }
    }

}
