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

import org.eclipse.jdt.core.dom.AST;
import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.Expression;
import org.eclipse.jdt.core.dom.FieldAccess;
import org.eclipse.jdt.core.dom.FieldDeclaration;
import org.eclipse.jdt.core.dom.MethodDeclaration;
import org.eclipse.jdt.core.dom.MethodInvocation;
import org.eclipse.jdt.core.dom.SimpleName;
import org.eclipse.jdt.core.dom.ThisExpression;
import org.eclipse.jdt.core.dom.TypeDeclaration;
import org.eclipse.jdt.core.dom.VariableDeclarationFragment;
import org.eclipse.jface.text.IRegion;

import java.util.List;

public class RequireThisQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @Override
            public boolean visit(final SimpleName node) {
                if (containsPosition(node, markerStartOffset)) {
                    replace(node, findFieldReplacement(node, node, 0));
                }
                return false;
            }

            @Override
            public boolean visit(final MethodInvocation node) {
                if (containsPosition(node, markerStartOffset)) {
                    replace(node, findMethodReplacement(node.getName(), node, node, 0));
                }
                return false;
            }

            private Expression findFieldReplacement(final SimpleName name, final ASTNode node, int typeLevel) {

                int level = typeLevel;

                final ASTNode parent = node.getParent();
                if (parent instanceof TypeDeclaration) {
                    level++;
                    final TypeDeclaration type = (TypeDeclaration) parent;
                    for (final FieldDeclaration fieldDeclaration : type.getFields()) {
                        @SuppressWarnings("unchecked")
                        final List<VariableDeclarationFragment> fragments = fieldDeclaration.fragments();
                        for (final VariableDeclarationFragment fragment : fragments) {
                            if (name.getFullyQualifiedName().equals(fragment.getName().getFullyQualifiedName())) {
                                return createFieldAccessReplacement(level == 1 ? null : type, name);
                            }
                        }
                    }
                }
                return findFieldReplacement(name, parent, level);
            }

            private FieldAccess createFieldAccessReplacement(final TypeDeclaration type, final SimpleName name) {
                final AST ast = name.getAST();
                final FieldAccess fieldAccess = ast.newFieldAccess();
                final ThisExpression thisExpr = ast.newThisExpression();
                if (type != null) {
                    thisExpr.setQualifier(copy(type.getName()));
                }
                fieldAccess.setExpression(thisExpr);
                fieldAccess.setName(copy(name));
                return fieldAccess;
            }

            private Expression findMethodReplacement(final SimpleName name, ASTNode contextNode,
                    final MethodInvocation node, int typeLevel) {

                int level = typeLevel;

                final ASTNode parent = contextNode.getParent();
                if (parent instanceof TypeDeclaration) {
                    level++;
                    final TypeDeclaration type = (TypeDeclaration) parent;
                    for (final MethodDeclaration methodDeclaration : type.getMethods()) {
                        if (name.getFullyQualifiedName().equals(methodDeclaration.getName().getFullyQualifiedName())) {
                            return createMethodInvocationReplacement(level == 1 ? null : type, node);
                        }
                    }
                }
                return findMethodReplacement(name, parent, node, level);
            }

            private Expression createMethodInvocationReplacement(final TypeDeclaration type,
                    MethodInvocation origMethodInvocation) {
                final AST ast = origMethodInvocation.getAST();
                final MethodInvocation methodInvocation = copy(origMethodInvocation);
                final ThisExpression thisExpr = ast.newThisExpression();
                if (type != null) {
                    thisExpr.setQualifier(copy(type.getName()));
                }
                methodInvocation.setExpression(thisExpr);
                return methodInvocation;
            }

        };
    }
}
