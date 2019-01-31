package com.shengchen.checkstyle.runner.quickfix.coding;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.VariableDeclarationFragment;
import org.eclipse.jface.text.IRegion;

public class ExplicitInitializationQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @Override
            public boolean visit(final VariableDeclarationFragment node) {
                if (containsPosition(node, markerStartOffset)) {
                    node.getInitializer().delete();
                }
                return false;
            }
        };
    }
}
