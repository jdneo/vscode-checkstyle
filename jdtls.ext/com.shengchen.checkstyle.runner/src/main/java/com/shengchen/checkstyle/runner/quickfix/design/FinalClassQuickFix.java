/*
 * Copyright (C) jdneo

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package com.shengchen.checkstyle.runner.quickfix.design;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;
import com.shengchen.checkstyle.runner.quickfix.modifier.ModifierOrderQuickFix;

import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.Modifier;
import org.eclipse.jdt.core.dom.Modifier.ModifierKeyword;
import org.eclipse.jdt.core.dom.TypeDeclaration;
import org.eclipse.jface.text.IRegion;

import java.util.List;

public class FinalClassQuickFix extends BaseQuickFix {

    /** The length of the javadoc comment declaration. */
    private static final int JAVADOC_COMMENT_LENGTH = 6;

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @SuppressWarnings("unchecked")
            @Override
            public boolean visit(TypeDeclaration node) {
                // recalculate start position because optional javadoc is mixed
                // into the original start position
                final int pos = node.getStartPosition() +
                        (node.getJavadoc() != null ? node.getJavadoc().getLength() + JAVADOC_COMMENT_LENGTH : 0);
                if (containsPosition(lineInfo, pos)) {

                    if (!Modifier.isFinal(node.getModifiers())) {

                        final Modifier finalModifier = node.getAST().newModifier(ModifierKeyword.FINAL_KEYWORD);
                        node.modifiers().add(finalModifier);

                        // reorder modifiers into their correct order
                        final List<?> reorderedModifiers = ModifierOrderQuickFix.reorderModifiers(node.modifiers());
                        node.modifiers().clear();
                        node.modifiers().addAll(reorderedModifiers);
                    }
                }
                return true;
            }
        };
    }
}
