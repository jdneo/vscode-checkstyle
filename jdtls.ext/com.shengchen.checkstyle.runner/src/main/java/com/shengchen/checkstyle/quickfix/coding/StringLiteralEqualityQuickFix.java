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
import org.eclipse.jdt.core.dom.Expression;
import org.eclipse.jdt.core.dom.InfixExpression;
import org.eclipse.jdt.core.dom.MethodInvocation;
import org.eclipse.jdt.core.dom.PrefixExpression;
import org.eclipse.jdt.core.dom.StringLiteral;
import org.eclipse.jface.text.IRegion;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;

public class StringLiteralEqualityQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @SuppressWarnings("unchecked")
            @Override
            public boolean visit(InfixExpression node) {

                if (containsPosition(lineInfo, node.getStartPosition())) {

                    StringLiteral literal = null;
                    Expression otherOperand = null;

                    if (node.getLeftOperand() instanceof StringLiteral) {
                        literal = (StringLiteral) node.getLeftOperand();
                        otherOperand = node.getRightOperand();
                    } else if (node.getRightOperand() instanceof StringLiteral) {
                        literal = (StringLiteral) node.getRightOperand();
                        otherOperand = node.getLeftOperand();
                    } else {
                        return true;
                    }

                    Expression replacementNode = null;

                    final MethodInvocation equalsInvocation = node.getAST().newMethodInvocation();
                    equalsInvocation.setName(node.getAST().newSimpleName("equals")); //$NON-NLS-1$
                    equalsInvocation.setExpression((Expression) ASTNode.copySubtree(node.getAST(), literal));
                    equalsInvocation.arguments().add(ASTNode.copySubtree(node.getAST(), otherOperand));

                    // if the string was compared with != create a not
                    // expression
                    if (node.getOperator().equals(InfixExpression.Operator.NOT_EQUALS)) {
                        final PrefixExpression prefixExpression = node.getAST().newPrefixExpression();
                        prefixExpression.setOperator(PrefixExpression.Operator.NOT);
                        prefixExpression.setOperand(equalsInvocation);
                        replacementNode = prefixExpression;
                    } else {
                        replacementNode = equalsInvocation;
                    }

                    replaceNode(node, replacementNode);
                }
                return true;
            }

            /**
             * Replaces the given node with the replacement node (using reflection since I
             * am not aware of a proper API to do this).
             *
             * @param node            the node to replace
             * @param replacementNode the replacement
             */
            private void replaceNode(ASTNode node, ASTNode replacementNode) {
                try {
                    if (node.getLocationInParent().isChildProperty()) {

                        final String property = node.getLocationInParent().getId();

                        final String capitalizedProperty = property.substring(0, 1).toUpperCase() +
                                property.substring(1);
                        final String setterMethodName = "set" + capitalizedProperty;

                        Class<?> testClass = node.getClass();

                        while (testClass != null) {

                            try {
                                final Method setterMethod = node.getParent().getClass().getMethod(setterMethodName,
                                        testClass);
                                setterMethod.invoke(node.getParent(), replacementNode);
                                break;
                            } catch (NoSuchMethodException e) {
                                testClass = testClass.getSuperclass();
                            }
                        }

                    } else if (node.getLocationInParent().isChildListProperty()) {
                        final Method listMethod = node.getParent().getClass()
                                .getMethod(node.getLocationInParent().getId(), (Class<?>[]) null);
                        @SuppressWarnings("unchecked")
                        final List<ASTNode> list = (List<ASTNode>) listMethod.invoke(node.getParent(), (Object[]) null);
                        list.set(list.indexOf(node), replacementNode);
                    }
                } catch (InvocationTargetException e) {
                    // TODO: log
                } catch (IllegalAccessException e) {
                    // TODO: log
                } catch (NoSuchMethodException e) {
                    // TODO: log
                }
            }
        };
    }

}
