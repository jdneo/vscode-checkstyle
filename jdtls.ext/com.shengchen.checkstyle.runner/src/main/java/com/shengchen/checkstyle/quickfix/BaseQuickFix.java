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

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public abstract class BaseQuickFix implements IQuickFix {
    public abstract ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset);

    /**
     * Determines if the given position lies within the boundaries of the ASTNode.
     *
     * @param node     the ASTNode
     * @param position the position to check for
     * @return <code>true</code> if the position is within the ASTNode
     */
    protected boolean containsPosition(ASTNode node, int position) {
        /* Check that the node has a start position, so we can detect nodes created by a quick fix that
           don't have their start position set correctly to enable other quick fixes to find it.
         */
        if (node.getStartPosition() == -1) {
            throw new IllegalStateException("Found node \"" + node.getClass().getName() + 
                "\" without a start position");
        }

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
        final T result = (T) ASTNode.copySubtree(node.getAST(), node);
        result.setSourceRange(node.getStartPosition(), node.getLength());
        return result;
    }

    /**
     * Returns a deep copy of the list of nodes using {@link #copy(ASTNode)}.
     * @param <T> the node type.
     * @param nodes the list of nodes to copy
     * @return the copied nodes
     */
    protected <T extends ASTNode> List<T> copy(final List<T> nodes) {
        return nodes.stream().map(this::copy).collect(Collectors.toList());
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
                replacement.setSourceRange(node.getStartPosition(), node.getLength());
                node.delete();
                return true;
            } else if (descriptor.isChildListProperty()) {
                @SuppressWarnings("unchecked")
                final List<ASTNode> children = (List<ASTNode>) parent.getStructuralProperty(descriptor);
                children.set(children.indexOf(node), replacement);
                replacement.setSourceRange(node.getStartPosition(), node.getLength());
                node.delete();
                return true;
            }
        }
        return false;
    }

    /**
     * Replaces a node in an AST child list one or more other nodes. If the replacement is successful
     * the original node is deleted.
     *
     * @param node        The node to replace.
     * @param replacements The replacement nodes.
     * @return <code>true</code> if the node was successfully replaced.
     */
    protected boolean replace(final ASTNode node, final Collection<ASTNode> replacements) {
        final ASTNode parent = node.getParent();
        final StructuralPropertyDescriptor descriptor = node.getLocationInParent();
        if (descriptor != null) {
            if (descriptor.isChildListProperty()) {
                @SuppressWarnings("unchecked")
                final List<ASTNode> children = (List<ASTNode>) parent.getStructuralProperty(descriptor);
                final int index = children.indexOf(node);
                children.remove(index);
                children.addAll(index, replacements);
                for (final ASTNode replacement : replacements) {
                    replacement.setSourceRange(node.getStartPosition(), node.getLength());
                }
                node.delete();
                return true;
            }
        }
        return false;
    }

    protected boolean append(final ASTNode node, final Collection<ASTNode> append) {
        final ASTNode parent = node.getParent();
        final StructuralPropertyDescriptor descriptor = node.getLocationInParent();
        if (descriptor != null) {
            if (descriptor.isChildListProperty()) {
                @SuppressWarnings("unchecked")
                final List<ASTNode> children = (List<ASTNode>) parent.getStructuralProperty(descriptor);
                final int index = children.indexOf(node);

                if (index != -1) {
                    children.addAll(index + 1, append);
                } else {
                    children.addAll(append);
                }

                for (final ASTNode replacement : append) {
                    replacement.setSourceRange(node.getStartPosition(), node.getLength());
                }
                return true;
            }
        }
        return false;
    }
}
