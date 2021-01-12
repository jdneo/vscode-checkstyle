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

package com.shengchen.checkstyle.quickfix.coding;

import com.shengchen.checkstyle.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.FieldDeclaration;
import org.eclipse.jdt.core.dom.VariableDeclarationFragment;
import org.eclipse.jface.text.IRegion;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class MultipleVariableDeclarationsQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @SuppressWarnings("unchecked")
            @Override
            public boolean visit(FieldDeclaration node) {
                if (containsPosition(node, markerStartOffset)) {
                    final Collection<ASTNode> replacements = new ArrayList<>();
                    for (final VariableDeclarationFragment fragment :
                            (List<VariableDeclarationFragment>) node.fragments()) {
                        final FieldDeclaration newFieldDeclaration = node.getAST().newFieldDeclaration(copy(fragment));
                        newFieldDeclaration.setType(copy(node.getType()));
                        newFieldDeclaration.modifiers().addAll(copy(node.modifiers()));
                        if (replacements.isEmpty() && node.getJavadoc() != null) {
                            newFieldDeclaration.setJavadoc(copy(node.getJavadoc()));
                        }
                        
                        replacements.add(newFieldDeclaration);
                    }
                    
                    replace(node, replacements);
                }
                return true;
            }
        };
    }
}
