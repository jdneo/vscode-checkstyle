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
import org.eclipse.jdt.core.dom.SwitchCase;
import org.eclipse.jdt.core.dom.SwitchStatement;
import org.eclipse.jface.text.IRegion;

public class MissingSwitchDefaultQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @SuppressWarnings("unchecked")
            @Override
            public boolean visit(SwitchStatement node) {
                if (containsPosition(lineInfo, node.getStartPosition())) {
                    final SwitchCase defNode = node.getAST().newSwitchCase();
                    defNode.setExpression(null);
                    node.statements().add(defNode);
                    node.statements().add(node.getAST().newBreakStatement());
                }
                return true; // also visit children
            }
        };
    }
}
