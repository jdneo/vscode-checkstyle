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
import org.eclipse.jdt.core.dom.ChildPropertyDescriptor;
import org.eclipse.jdt.core.dom.EmptyStatement;
import org.eclipse.jdt.core.dom.StructuralPropertyDescriptor;
import org.eclipse.jface.text.IRegion;

public class EmptyStatementQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {
            @Override
            public boolean visit(EmptyStatement node) {
                if (containsPosition(lineInfo, node.getStartPosition())) {

                    // early exit if the statement is mandatory, e.g. only
                    // statement in a for-statement without block
                    final StructuralPropertyDescriptor p = node.getLocationInParent();
                    if (p.isChildProperty() && ((ChildPropertyDescriptor) p).isMandatory()) {
                        return false;
                    }

                    node.delete();
                }
                return false;
            }
        };
    }
}
