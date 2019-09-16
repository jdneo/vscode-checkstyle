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

import com.shengchen.checkstyle.runner.api.CheckResult;
import com.shengchen.checkstyle.runner.api.ICheckerService;
import com.shengchen.checkstyle.runner.api.IQuickFixService;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.jdt.core.JavaModelException;
import org.eclipse.jdt.ls.core.internal.IDelegateCommandHandler;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.lsp4j.WorkspaceEdit;

import java.lang.reflect.Method;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@SuppressWarnings("restriction")
public class DelegateCommandHandler implements IDelegateCommandHandler {

    private static final String CHECKSTYLE_PREFIX = "java.checkstyle.server.";

    private CheckstyleLoader checkstyleLoader = new CheckstyleLoader();
    private ICheckerService checkerService = null;
    private IQuickFixService quickfixService = null;

    @Override
    public Object executeCommand(String commandId, List<Object> arguments, IProgressMonitor monitor) throws Exception {
        if (commandId.startsWith(CHECKSTYLE_PREFIX)) { // Only handle commands with specific id prefix
            final String command = commandId.substring(CHECKSTYLE_PREFIX.length()); // Remove prefix as handler name
            for (final Method handler : this.getClass().getDeclaredMethods()) {
                if (handler.getName().equals(command)) { // Dispatch to CheckStyleRunner's corresponding handler
                    return handler.invoke(this, arguments.toArray());
                }
            }
        }
        return null;
    }

    public void setConfiguration(Map<String, Object> config) throws Exception {
        final String jarStorage = (String) config.get("jarStorage");
        final String version = (String) config.get("version");
        final String jarPath = String.format("%s/checkstyle-%s-all.jar", jarStorage, version);
        if (!version.equals(getVersion())) { // If not equal, load new version
            if (checkerService != null) {
                checkerService.dispose();
            }
            checkerService = checkstyleLoader.loadCheckerService(jarPath);
            checkerService.initialize();
        }
        checkerService.setConfiguration(config);
    }

    public String getVersion() throws Exception {
        if (checkerService != null) {
            return checkerService.getVersion();
        }
        return "";
    }

    public Map<String, List<CheckResult>> checkCode(List<String> filesToCheckUris) throws Exception {
        if (filesToCheckUris.isEmpty()) {
            return Collections.emptyMap();
        }
        return checkerService.checkCode(filesToCheckUris);
    }

    public WorkspaceEdit quickFix(
        String fileToCheckUri,
        Double offset,
        String sourceName
    ) throws JavaModelException, IllegalArgumentException, BadLocationException {
        if (quickfixService == null) {
            // quickfixService = checkstyleLoader.loadQuickFixService();
        }
        return quickfixService.quickFix(fileToCheckUri, offset, sourceName);
    }
}