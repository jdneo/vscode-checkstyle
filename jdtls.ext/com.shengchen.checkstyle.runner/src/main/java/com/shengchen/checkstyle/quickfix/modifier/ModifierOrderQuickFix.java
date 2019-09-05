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
import org.eclipse.jdt.core.dom.AnnotationTypeMemberDeclaration;
import org.eclipse.jdt.core.dom.BodyDeclaration;
import org.eclipse.jdt.core.dom.FieldDeclaration;
import org.eclipse.jdt.core.dom.MethodDeclaration;
import org.eclipse.jdt.core.dom.Modifier;
import org.eclipse.jdt.core.dom.Modifier.ModifierKeyword;
import org.eclipse.jdt.core.dom.TypeDeclaration;
import org.eclipse.jface.text.IRegion;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

public class ModifierOrderQuickFix extends BaseQuickFix {

    /**
     * List containing modifier keywords in the order proposed by Java Language
     * specification, sections 8.1.1, 8.3.1 and 8.4.3.
     */
    private static final List<Object> MODIFIER_ORDER = Arrays.asList(new Object[] { ModifierKeyword.PUBLIC_KEYWORD,
        ModifierKeyword.PROTECTED_KEYWORD, ModifierKeyword.PRIVATE_KEYWORD, ModifierKeyword.ABSTRACT_KEYWORD,
        ModifierKeyword.STATIC_KEYWORD, ModifierKeyword.FINAL_KEYWORD, ModifierKeyword.TRANSIENT_KEYWORD,
        ModifierKeyword.VOLATILE_KEYWORD, ModifierKeyword.SYNCHRONIZED_KEYWORD, ModifierKeyword.NATIVE_KEYWORD,
        ModifierKeyword.STRICTFP_KEYWORD, ModifierKeyword.DEFAULT_KEYWORD });

    public static List<ASTNode> reorderModifiers(List<ASTNode> modifiers) {

        final List<ASTNode> copies = new ArrayList<>();
        final Iterator<ASTNode> it = modifiers.iterator();
        while (it.hasNext()) {
            final ASTNode mod = it.next();
            copies.add(ASTNode.copySubtree(mod.getAST(), mod));
        }

        Collections.sort(copies, new Comparator<ASTNode>() {

            @Override
            public int compare(ASTNode arg0, ASTNode arg1) {
                if (!(arg0 instanceof Modifier) || !(arg1 instanceof Modifier)) {
                    return 0;
                }

                final Modifier m1 = (Modifier) arg0;
                final Modifier m2 = (Modifier) arg1;

                final int modifierIndex1 = MODIFIER_ORDER.indexOf(m1.getKeyword());
                final int modifierIndex2 = MODIFIER_ORDER.indexOf(m2.getKeyword());

                return new Integer(modifierIndex1).compareTo(new Integer(modifierIndex2));
            }
        });

        return copies;
    }

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @Override
            public boolean visit(TypeDeclaration node) {
                return visitBodyDecl(node);
            }

            @Override
            public boolean visit(MethodDeclaration node) {
                return visitBodyDecl(node);
            }

            @Override
            public boolean visit(FieldDeclaration node) {
                return visitBodyDecl(node);
            }

            @Override
            public boolean visit(AnnotationTypeMemberDeclaration node) {
                return visitBodyDecl(node);
            }

            @SuppressWarnings("unchecked")
            private boolean visitBodyDecl(BodyDeclaration node) {
                final List<Modifier> modifiers = (List<Modifier>) node.modifiers().stream()
                        .filter(Modifier.class::isInstance).map(Modifier.class::cast).collect(Collectors.toList());
                if (modifiers == null || modifiers.isEmpty()) {
                    return true;
                }
                // find the range from first to last modifier. marker must be in between
                final int minPos = modifiers.stream().mapToInt(Modifier::getStartPosition).min().getAsInt();
                final int maxPos = modifiers.stream().mapToInt(Modifier::getStartPosition).max().getAsInt();

                if (minPos <= markerStartOffset && markerStartOffset <= maxPos) {
                    final List<?> reorderedModifiers = reorderModifiers(node.modifiers());
                    node.modifiers().clear();
                    node.modifiers().addAll(reorderedModifiers);
                }
                return true;
            }
        };
    }
}
