package com.shengchen.checkstyle.runner.quickfix.design;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;
import com.shengchen.checkstyle.runner.quickfix.modifier.ModifierOrderQuickFix;

import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.MethodDeclaration;
import org.eclipse.jdt.core.dom.Modifier;
import org.eclipse.jdt.core.dom.Modifier.ModifierKeyword;
import org.eclipse.jface.text.IRegion;

import java.util.List;

public class DesignForExtensionQuickFix extends BaseQuickFix {

    /** The length of the javadoc comment declaration. */
    private static final int JAVADOC_COMMENT_LENGTH = 6;

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @SuppressWarnings("unchecked")
            @Override
            public boolean visit(MethodDeclaration node) {
                // recalculate start position because optional javadoc is mixed
                // into the original start position
                final int pos = node.getStartPosition() +
                        (node.getJavadoc() != null ? node.getJavadoc().getLength() + JAVADOC_COMMENT_LENGTH : 0);
                if (containsPosition(lineInfo, pos)) {

                    if (!Modifier.isFinal(node.getModifiers())) {

                        final Modifier finalModifier = node.getAST().newModifier(ModifierKeyword.FINAL_KEYWORD);
                        node.modifiers().add(finalModifier);

                        // reorder modifiers into their correct order
                        final List<ASTNode> reorderedModifiers = ModifierOrderQuickFix
                                .reorderModifiers(node.modifiers());
                        node.modifiers().clear();
                        node.modifiers().addAll(reorderedModifiers);
                    }
                }
                return true;
            }
        };
    }
}
