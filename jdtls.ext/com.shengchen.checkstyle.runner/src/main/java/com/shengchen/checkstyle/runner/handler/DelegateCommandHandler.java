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

import java.lang.reflect.Method;
import java.util.List;

@SuppressWarnings("restriction")
public class DelegateCommandHandler implements IDelegateCommandHandler {

    private static final String CHECKSTYLE_PREFIX = "java.checkstyle.";
    
    @Override
    public Object executeCommand(String commandId, List<Object> arguments, IProgressMonitor monitor) throws Exception {
        if (commandId.startsWith(CHECKSTYLE_PREFIX)) { // Only handle commands with specific id prefix
            final String command = commandId.substring(CHECKSTYLE_PREFIX.length()); // Remove prefix as handler name
            for (final Method handler : CheckstyleRunner.class.getDeclaredMethods()) {
                if (handler.getName().equals(command)) { // Dispatch to CheckStyleRunner's corresponding handler
                    return handler.invoke(null, arguments.toArray());
                }
            }
        };
        return null;
    }
}
