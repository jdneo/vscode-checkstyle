package com.shengchen.checkstyle.runner.quickfix.coding;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.SwitchCase;
import org.eclipse.jdt.core.dom.SwitchStatement;
import org.eclipse.jface.text.IRegion;

import java.util.ArrayList;
import java.util.List;

public class DefaultComesLastQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @SuppressWarnings("unchecked")
            @Override
            public boolean visit(SwitchCase node) {

                if (containsPosition(lineInfo, node.getStartPosition())) {

                    if (node.isDefault() && !isLastSwitchCase(node)) {
                        final SwitchStatement switchStatement = (SwitchStatement) node.getParent();

                        final List<ASTNode> defaultCaseStatements = new ArrayList<>();
                        defaultCaseStatements.add(node);

                        // collect all statements belonging to the default case
                        final int defaultStatementIndex = switchStatement.statements().indexOf(node);
                        for (int i = defaultStatementIndex + 1; i < switchStatement.statements().size(); i++) {
                            final ASTNode tmpNode = (ASTNode) switchStatement.statements().get(i);

                            if (!(tmpNode instanceof SwitchCase)) {
                                defaultCaseStatements.add(tmpNode);
                            } else {
                                break;
                            }
                        }

                        // move the statements to the end of the statement list
                        switchStatement.statements().removeAll(defaultCaseStatements);
                        switchStatement.statements().addAll(defaultCaseStatements);
                    }
                }
                return true;
            }

            private boolean isLastSwitchCase(SwitchCase switchCase) {

                final SwitchStatement switchStatement = (SwitchStatement) switchCase.getParent();

                // collect all statements belonging to the default case
                final int defaultStatementIndex = switchStatement.statements().indexOf(switchCase);
                for (int i = defaultStatementIndex + 1; i < switchStatement.statements().size(); i++) {
                    final ASTNode tmpNode = (ASTNode) switchStatement.statements().get(i);

                    if (tmpNode instanceof SwitchCase) {
                        return false;
                    }
                }
                return true;
            }
        };
    }
}
