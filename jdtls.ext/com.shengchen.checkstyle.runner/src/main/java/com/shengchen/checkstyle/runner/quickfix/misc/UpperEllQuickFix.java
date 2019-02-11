package com.shengchen.checkstyle.runner.quickfix.misc;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.NumberLiteral;
import org.eclipse.jface.text.IRegion;

public class UpperEllQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @Override
            public boolean visit(NumberLiteral node) {
                if (containsPosition(node, markerStartOffset)) {

                    String token = node.getToken();
                    if (token.endsWith("l")) { //$NON-NLS-1$
                        token = token.replace('l', 'L');
                        node.setToken(token);
                    }
                }
                return true;
            }
        };
    }
}
