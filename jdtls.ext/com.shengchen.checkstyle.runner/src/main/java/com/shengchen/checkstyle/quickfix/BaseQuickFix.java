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

package com.shengchen.checkstyle.quickfix;

import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.StructuralPropertyDescriptor;
import org.eclipse.jface.text.IRegion;

import java.util.List;

public abstract class BaseQuickFix {
    public abstract ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset);

    /**
     * Determines if the given position lies within the boundaries of the ASTNode.
     *
     * @param node     the ASTNode
     * @param position the position to check for
     * @return <code>true</code> if the position is within the ASTNode
     */
    protected boolean containsPosition(ASTNode node, int position) {
        return node.getStartPosition() <= position && position <= node.getStartPosition() + node.getLength();
    }

    /**
     * Determines if the given position lies within the boundaries of the region.
     *
     * @param region   the region
     * @param position the position to check for
     * @return <code>true</code> if the position is within the region
     */
    protected boolean containsPosition(IRegion region, int position) {
        return region.getOffset() <= position && position <= region.getOffset() + region.getLength();
    }

    /**
     * Returns a deep copy of the subtree of AST nodes rooted at the given node. The
     * resulting nodes are owned by the same AST as the given node. Even if the
     * given node has a parent, the result node will be unparented.
     * <p>
     * Source range information on the original nodes is automatically copied to the
     * new nodes. Client properties ( <code>properties</code>) are not carried over.
     * </p>
     * <p>
     * The node's <code>AST</code> and the target <code>AST</code> must support the
     * same API level.
     * </p>
     *
     * @param node the node to copy, or <code>null</code> if none
     *
     * @return the copied node, or <code>null</code> if <code>node</code> is
     *         <code>null</code>
     */
    @SuppressWarnings("unchecked")
    protected <T extends ASTNode> T copy(final T node) {
        return (T) ASTNode.copySubtree(node.getAST(), node);
    }

    /**
     * Replaces a node in an AST with another node. If the replacement is successful
     * the original node is deleted.
     *
     * @param node        The node to replace.
     * @param replacement The replacement node.
     * @return <code>true</code> if the node was successfully replaced.
     */
    protected boolean replace(final ASTNode node, final ASTNode replacement) {
        final ASTNode parent = node.getParent();
        final StructuralPropertyDescriptor descriptor = node.getLocationInParent();
        if (descriptor != null) {
            if (descriptor.isChildProperty()) {
                parent.setStructuralProperty(descriptor, replacement);
                node.delete();
                return true;
            } else if (descriptor.isChildListProperty()) {
                @SuppressWarnings("unchecked")
                final List<ASTNode> children = (List<ASTNode>) parent.getStructuralProperty(descriptor);
                children.set(children.indexOf(node), replacement);
                node.delete();
                return true;
            }
        }
        return false;
    }
}
