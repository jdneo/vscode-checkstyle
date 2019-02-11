package com.shengchen.checkstyle.runner.quickfix.misc;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.Modifier;
import org.eclipse.jdt.core.dom.Modifier.ModifierKeyword;
import org.eclipse.jdt.core.dom.SingleVariableDeclaration;
import org.eclipse.jface.text.IRegion;

public class FinalParametersQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @SuppressWarnings("unchecked")
            @Override
            public boolean visit(SingleVariableDeclaration node) {
                if (containsPosition(node, markerStartOffset) && !Modifier.isFinal(node.getModifiers())) {
                    if (!Modifier.isFinal(node.getModifiers())) {
                        final Modifier finalModifier = node.getAST().newModifier(ModifierKeyword.FINAL_KEYWORD);
                        node.modifiers().add(finalModifier);
                    }
                }
                return true;
            }
        };
    }
}
