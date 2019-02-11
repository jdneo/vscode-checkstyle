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

package com.shengchen.checkstyle.runner.quickfix.blocks;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.AST;
import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.Block;
import org.eclipse.jdt.core.dom.DoStatement;
import org.eclipse.jdt.core.dom.ForStatement;
import org.eclipse.jdt.core.dom.IfStatement;
import org.eclipse.jdt.core.dom.Statement;
import org.eclipse.jdt.core.dom.WhileStatement;
import org.eclipse.jface.text.IRegion;

public class NeedBracesQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {
            @Override
            public boolean visit(IfStatement node) {

                final int nodePos = node.getStartPosition();
                final int nodeEnd = nodePos + node.getLength();
                if ((nodePos >= lineInfo.getOffset() && nodePos <= (lineInfo.getOffset() + lineInfo.getLength())) ||
                        (nodePos <= lineInfo.getOffset() && nodeEnd >= lineInfo.getOffset() + lineInfo.getLength())) {
                    bracifyIfStatement(node);
                }

                return true;
            }

            // TODO: recursively block the statement like what we did in if-block
            @Override
            public boolean visit(ForStatement node) {
                if (containsPosition(lineInfo, node.getStartPosition())) {
                    final Block block = createBracifiedCopy(node.getAST(), node.getBody());
                    node.setBody(block);
                }

                return true;
            }

            @Override
            public boolean visit(DoStatement node) {
                if (containsPosition(lineInfo, node.getStartPosition())) {
                    final Block block = createBracifiedCopy(node.getAST(), node.getBody());
                    node.setBody(block);
                }

                return true;
            }

            @Override
            public boolean visit(WhileStatement node) {
                if (containsPosition(lineInfo, node.getStartPosition())) {
                    final Block block = createBracifiedCopy(node.getAST(), node.getBody());
                    node.setBody(block);
                }

                return true;
            }

            /**
             * Helper method to recursively bracify a if-statement.
             *
             * @param ifStatement the if statement
             */
            private void bracifyIfStatement(IfStatement ifStatement) {

                // change the then statement to a block if necessary
                if (!(ifStatement.getThenStatement() instanceof Block)) {
                    if (ifStatement.getThenStatement() instanceof IfStatement) {
                        bracifyIfStatement((IfStatement) ifStatement.getThenStatement());
                    }
                    final Block block = createBracifiedCopy(ifStatement.getAST(), ifStatement.getThenStatement());
                    ifStatement.setThenStatement(block);
                }

                // check the else statement if it is a block
                final Statement elseStatement = ifStatement.getElseStatement();
                if (elseStatement != null && !(elseStatement instanceof Block)) {

                    // in case the else statement is an further if statement
                    // (else if)
                    // do the recursion
                    if (elseStatement instanceof IfStatement) {
                        bracifyIfStatement((IfStatement) elseStatement);
                    } else {
                        // change the else statement to a block
                        // Block block = ifStatement.getAST().newBlock();
                        // block.statements().add(ASTNode.copySubtree(block.getAST(),
                        // elseStatement));
                        final Block block = createBracifiedCopy(ifStatement.getAST(), ifStatement.getElseStatement());
                        ifStatement.setElseStatement(block);
                    }
                }
            }

            @SuppressWarnings("unchecked")
            private Block createBracifiedCopy(AST ast, Statement body) {
                final Block block = ast.newBlock();
                block.statements().add(ASTNode.copySubtree(block.getAST(), body));
                return block;
            }
        };
    }
}
