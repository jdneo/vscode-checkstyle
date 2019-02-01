package com.shengchen.checkstyle.runner.quickfix.misc;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.MethodDeclaration;
import org.eclipse.jface.text.IRegion;

public class UncommentedMainQuickFix extends BaseQuickFix {

    /** The length of the javadoc comment declaration. */
    private static final int JAVADOC_COMMENT_LENGTH = 6;

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @Override
            public boolean visit(MethodDeclaration node) {
                // recalculate start position because optional javadoc is mixed
                // into the original start position
                final int pos = node.getStartPosition() +
                        (node.getJavadoc() != null ? node.getJavadoc().getLength() + JAVADOC_COMMENT_LENGTH : 0);
                if (containsPosition(lineInfo, pos) && node.getName().getFullyQualifiedName().equals("main")) {
                    node.delete();
                }
                return true;
            }
        };
    }
}
