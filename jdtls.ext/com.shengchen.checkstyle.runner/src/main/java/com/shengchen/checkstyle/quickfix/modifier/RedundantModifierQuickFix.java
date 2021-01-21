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

package com.shengchen.checkstyle.quickfix.modifier;

import com.shengchen.checkstyle.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.AnnotationTypeDeclaration;
import org.eclipse.jdt.core.dom.AnnotationTypeMemberDeclaration;
import org.eclipse.jdt.core.dom.FieldDeclaration;
import org.eclipse.jdt.core.dom.MethodDeclaration;
import org.eclipse.jdt.core.dom.Modifier;
import org.eclipse.jdt.core.dom.Modifier.ModifierKeyword;
import org.eclipse.jdt.core.dom.TypeDeclaration;
import org.eclipse.jface.text.IRegion;

import java.util.Arrays;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

public class RedundantModifierQuickFix extends BaseQuickFix {

    /** The length of the javadoc comment declaration. */
    private static final int JAVADOC_COMMENT_LENGTH = 6;

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @SuppressWarnings("unchecked")
            public boolean visit(TypeDeclaration node) {
                if (containsPosition(node, markerStartOffset)) {
                    List<ModifierKeyword> redundantKeyWords = Collections.emptyList();

                    if (node.isInterface()) {
                        redundantKeyWords = Arrays.asList(new ModifierKeyword[] { ModifierKeyword.ABSTRACT_KEYWORD,
                            ModifierKeyword.STATIC_KEYWORD });
                    }

                    deleteRedundantModifiers(node.modifiers(), redundantKeyWords);
                }
                return true;
            }

            @SuppressWarnings("unchecked")
            @Override
            public boolean visit(MethodDeclaration node) {

                if (containsPosition(node, markerStartOffset)) {
                    List<ModifierKeyword> redundantKeyWords = Collections.emptyList();

                    if (node.getParent() instanceof TypeDeclaration) {
                        final TypeDeclaration type = (TypeDeclaration) node.getParent();
                        if (type.isInterface()) {
                            redundantKeyWords = Arrays.asList(new ModifierKeyword[] { ModifierKeyword.PUBLIC_KEYWORD,
                                ModifierKeyword.ABSTRACT_KEYWORD, ModifierKeyword.FINAL_KEYWORD });
                        } else if (Modifier.isFinal(type.getModifiers())) {
                            redundantKeyWords = Arrays.asList(new ModifierKeyword[] { ModifierKeyword.FINAL_KEYWORD });
                        }
                    }

                    deleteRedundantModifiers(node.modifiers(), redundantKeyWords);
                }
                return true;
            }

            @SuppressWarnings("unchecked")
            @Override
            public boolean visit(FieldDeclaration node) {
                // recalculate start position because optional javadoc is mixed
                // into the original start position
                final int pos = node.getStartPosition() +
                        (node.getJavadoc() != null ? node.getJavadoc().getLength() + JAVADOC_COMMENT_LENGTH : 0);
                if (containsPosition(lineInfo, pos)) {
                    List<ModifierKeyword> redundantKeyWords = Collections.emptyList();

                    if (node.getParent() instanceof TypeDeclaration) {
                        final TypeDeclaration type = (TypeDeclaration) node.getParent();
                        if (type.isInterface()) {
                            redundantKeyWords = Arrays.asList(new ModifierKeyword[] { ModifierKeyword.PUBLIC_KEYWORD,
                                ModifierKeyword.ABSTRACT_KEYWORD, ModifierKeyword.FINAL_KEYWORD,
                                ModifierKeyword.STATIC_KEYWORD });
                        }
                    } else if (node.getParent() instanceof AnnotationTypeDeclaration) {

                        redundantKeyWords = Arrays.asList(new ModifierKeyword[] { ModifierKeyword.PUBLIC_KEYWORD,
                            ModifierKeyword.ABSTRACT_KEYWORD, ModifierKeyword.FINAL_KEYWORD,
                            ModifierKeyword.STATIC_KEYWORD });
                    }

                    deleteRedundantModifiers(node.modifiers(), redundantKeyWords);
                }
                return true;
            }

            @SuppressWarnings("unchecked")
            @Override
            public boolean visit(AnnotationTypeMemberDeclaration node) {

                // recalculate start position because optional javadoc is mixed
                // into the original start position
                final int pos = node.getStartPosition() +
                        (node.getJavadoc() != null ? node.getJavadoc().getLength() + JAVADOC_COMMENT_LENGTH : 0);
                if (containsPosition(lineInfo, pos)) {

                    if (node.getParent() instanceof AnnotationTypeDeclaration) {

                        final List<ModifierKeyword> redundantKeyWords = Arrays.asList(new ModifierKeyword[] {
                            ModifierKeyword.PUBLIC_KEYWORD, ModifierKeyword.ABSTRACT_KEYWORD,
                            ModifierKeyword.FINAL_KEYWORD, ModifierKeyword.STATIC_KEYWORD });

                        deleteRedundantModifiers(node.modifiers(), redundantKeyWords);
                    }

                }
                return true;
            }

            private void deleteRedundantModifiers(List<ASTNode> modifiers,
                    List<ModifierKeyword> redundantModifierKeywords) {

                final Iterator<ASTNode> it = modifiers.iterator();

                while (it.hasNext()) {
                    final ASTNode node = it.next();

                    if (node instanceof Modifier) {
                        final Modifier modifier = (Modifier) node;
                        if (redundantModifierKeywords.contains(modifier.getKeyword())) {
                            it.remove();
                        }
                    }
                }
            }
        };
    }
}
