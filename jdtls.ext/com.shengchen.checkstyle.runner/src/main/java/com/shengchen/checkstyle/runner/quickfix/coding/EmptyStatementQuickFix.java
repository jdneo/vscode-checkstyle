package com.shengchen.checkstyle.runner.quickfix.coding;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.ChildPropertyDescriptor;
import org.eclipse.jdt.core.dom.EmptyStatement;
import org.eclipse.jdt.core.dom.StructuralPropertyDescriptor;
import org.eclipse.jface.text.IRegion;

public class EmptyStatementQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {
            @Override
            public boolean visit(EmptyStatement node) {
                if (containsPosition(lineInfo, node.getStartPosition())) {

                    // early exit if the statement is mandatory, e.g. only
                    // statement in a for-statement without block
                    final StructuralPropertyDescriptor p = node.getLocationInParent();
                    if (p.isChildProperty() && ((ChildPropertyDescriptor) p).isMandatory()) {
                        return false;
                    }

                    node.delete();
                }
                return false;
            }
        };
    }
}
