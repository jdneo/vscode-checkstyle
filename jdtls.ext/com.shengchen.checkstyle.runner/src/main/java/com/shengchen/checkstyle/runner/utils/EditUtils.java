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
