package com.shengchen.checkstyle.runner.quickfix.coding;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.Modifier;
import org.eclipse.jdt.core.dom.Modifier.ModifierKeyword;
import org.eclipse.jdt.core.dom.SingleVariableDeclaration;
import org.eclipse.jdt.core.dom.VariableDeclarationStatement;
import org.eclipse.jface.text.IRegion;

public class FinalLocalVariableQuickFix extends BaseQuickFix {
    @Override
    @SuppressWarnings("unchecked")
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @Override
            public boolean visit(SingleVariableDeclaration node) {
                if (containsPosition(node, markerStartOffset) && !Modifier.isFinal(node.getModifiers())) {
                    final Modifier finalModifier = node.getAST().newModifier(ModifierKeyword.FINAL_KEYWORD);
                    node.modifiers().add(finalModifier);
                }
                return true;
            }

            @Override
            public boolean visit(VariableDeclarationStatement node) {
                if (containsPosition(node, markerStartOffset) && !Modifier.isFinal(node.getModifiers())) {
                    final Modifier finalModifier = node.getAST().newModifier(ModifierKeyword.FINAL_KEYWORD);
                    node.modifiers().add(finalModifier);
                }
                return true;
            }
        };
    }
}
