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

import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.FieldDeclaration;
import org.eclipse.jdt.core.dom.Modifier;
import org.eclipse.jdt.core.dom.Modifier.ModifierKeyword;
import org.eclipse.jdt.core.dom.NumberLiteral;
import org.eclipse.jdt.core.dom.TypeDeclaration;
import org.eclipse.jdt.core.dom.VariableDeclarationFragment;
import org.eclipse.jface.text.IRegion;

import java.util.List;

public class MagicNumberQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @Override
            public boolean visit(NumberLiteral node) {
                if (containsPosition(node, markerStartOffset)) {
                    final TypeDeclaration container = ancestor(node, TypeDeclaration.class);
                    if (container != null) {
                        final String newConstantName = createOrReuseConstant(node, container);

                        replace(node, node.getAST().newSimpleName(newConstantName));
                        return true;
                    }
                }
                return true;
            }
            
            @SuppressWarnings("unchecked")
            private String createOrReuseConstant(NumberLiteral node, final TypeDeclaration container) {
                OUTER:
                for (int iteration = 0; ; iteration++) {
                    final String newConstantName = generateConstantName(node, iteration);

                    /* Check for an existing constant with our newConstantName, to support correcting multiple
                       magic numbers at once.
                    */
                    for (final Object candidate : container.bodyDeclarations()) {
                        if (!(candidate instanceof FieldDeclaration)) {
                            continue;
                        }

                        final FieldDeclaration field = (FieldDeclaration) candidate;
                        for (final VariableDeclarationFragment fragment :
                            ((List<VariableDeclarationFragment>) field.fragments())) {
                            if (newConstantName.equals(fragment.getName().getIdentifier())) {
                                if (field.getModifiers() ==
                                    (Modifier.FINAL | Modifier.PRIVATE | Modifier.STATIC) &&
                                    fragment.getInitializer() != null &&
                                    fragment.getInitializer() instanceof NumberLiteral &&
                                    node.getToken().equals(((NumberLiteral) fragment.getInitializer()).getToken())) {
                                    /* We can use this existing constant */
                                    return newConstantName;
                                } else {
                                    /* We cannot use this constant so we need to come up with a new name */
                                    continue OUTER;
                                }
                            }
                        }
                    }
                    
                    /* Make a new constant */
                    final VariableDeclarationFragment fragment = node.getAST().newVariableDeclarationFragment();
                    fragment.setName(node.getAST().newSimpleName(newConstantName));
                    fragment.setInitializer(copy(node));

                    final FieldDeclaration constantElement = node.getAST().newFieldDeclaration(fragment);
                    constantElement.modifiers().add(node.getAST().newModifier(ModifierKeyword.PRIVATE_KEYWORD));
                    constantElement.modifiers().add(node.getAST().newModifier(ModifierKeyword.STATIC_KEYWORD));
                    constantElement.modifiers().add(node.getAST().newModifier(ModifierKeyword.FINAL_KEYWORD));
                    container.bodyDeclarations().add(0, constantElement);
                    return newConstantName;
                }
            }

            private String generateConstantName(NumberLiteral node, int iteration) {
                return "_" + (iteration > 0 ? iteration + "_" : "") + node.getToken();
            }
            
        };
    }
}
