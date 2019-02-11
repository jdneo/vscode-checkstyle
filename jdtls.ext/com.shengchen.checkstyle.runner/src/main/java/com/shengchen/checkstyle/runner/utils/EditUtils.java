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

package com.shengchen.checkstyle.runner.utils;

import org.eclipse.jdt.core.ICompilationUnit;
import org.eclipse.jdt.ls.core.internal.JDTUtils;
import org.eclipse.jdt.ls.core.internal.TextEditConverter;
import org.eclipse.lsp4j.WorkspaceEdit;
import org.eclipse.text.edits.TextEdit;

@SuppressWarnings("restriction")
public class EditUtils {

    public static WorkspaceEdit convertToWorkspaceEdit(ICompilationUnit unit, TextEdit edit) {
        final WorkspaceEdit workspaceEdit = new WorkspaceEdit();
        final TextEditConverter converter = new TextEditConverter(unit, edit);
        final String uri = JDTUtils.toURI(unit);
        workspaceEdit.getChanges().put(uri, converter.convert());
        return workspaceEdit;
    }
}
