package com.shengchen.checkstyle.runner.quickfix;

import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jface.text.IRegion;

public abstract class BaseQuickFix {
    public abstract ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset);

    protected boolean containsPosition(ASTNode node, int position) {
        return node.getStartPosition() <= position && position <= node.getStartPosition() + node.getLength();
    }

    protected boolean containsPosition(IRegion region, int position) {
        return region.getOffset() <= position && position <= region.getOffset() + region.getLength();
    }
}
