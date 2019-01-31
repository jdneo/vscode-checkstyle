package com.shengchen.checkstyle.runner.quickfix.coding;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.SwitchCase;
import org.eclipse.jdt.core.dom.SwitchStatement;
import org.eclipse.jface.text.IRegion;

public class MissingSwitchDefaultQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @SuppressWarnings("unchecked")
            @Override
            public boolean visit(SwitchStatement node) {
                if (containsPosition(lineInfo, node.getStartPosition())) {
                    final SwitchCase defNode = node.getAST().newSwitchCase();
                    defNode.setExpression(null);
                    node.statements().add(defNode);
                    node.statements().add(node.getAST().newBreakStatement());
                }
                return true; // also visit children
            }
        };
    }
}
