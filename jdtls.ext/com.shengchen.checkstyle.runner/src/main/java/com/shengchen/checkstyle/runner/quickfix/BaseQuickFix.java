package com.shengchen.checkstyle.runner.quickfix;

import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTVisitor;

public abstract class BaseQuickFix {
    public abstract ASTVisitor getCorrectingASTVisitor(int markerStartOffset);

    protected boolean containsPosition(ASTNode node, int position) {
        return node.getStartPosition() <= position && position <= node.getStartPosition() + node.getLength();
    }
}
