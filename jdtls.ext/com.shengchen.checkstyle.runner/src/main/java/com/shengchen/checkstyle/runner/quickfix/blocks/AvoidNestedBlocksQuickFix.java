package com.shengchen.checkstyle.runner.quickfix.blocks;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.Block;
import org.eclipse.jdt.core.dom.SwitchStatement;
import org.eclipse.jface.text.IRegion;

import java.util.List;

public class AvoidNestedBlocksQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @SuppressWarnings("unchecked")
            @Override
            public boolean visit(Block node) {

                if (containsPosition(lineInfo, node.getStartPosition())) {

                    if (node.getParent() instanceof Block) {

                        final List<?> statements = ((Block) node.getParent()).statements();
                        final int index = statements.indexOf(node);

                        statements.remove(node);
                        statements.addAll(index, ASTNode.copySubtrees(node.getAST(), node.statements()));

                    } else if (node.getParent() instanceof SwitchStatement) {

                        final List<?> statements = ((SwitchStatement) node.getParent()).statements();
                        final int index = statements.indexOf(node);

                        statements.remove(node);
                        statements.addAll(index, ASTNode.copySubtrees(node.getAST(), node.statements()));
                    }
                }
                return true;
            }
        };
    }
}
