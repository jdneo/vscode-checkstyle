package com.shengchen.checkstyle.runner.quickfix.misc;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;

import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.ArrayType;
import org.eclipse.jdt.core.dom.FieldDeclaration;
import org.eclipse.jdt.core.dom.SingleVariableDeclaration;
import org.eclipse.jdt.core.dom.Type;
import org.eclipse.jdt.core.dom.VariableDeclaration;
import org.eclipse.jdt.core.dom.VariableDeclarationStatement;
import org.eclipse.jface.text.IRegion;

import java.util.Iterator;
import java.util.List;

public class ArrayTypeStyleQuickFix extends BaseQuickFix {

    @Override
    public ASTVisitor getCorrectingASTVisitor(IRegion lineInfo, int markerStartOffset) {
        return new ASTVisitor() {

            @Override
            public boolean visit(VariableDeclarationStatement node) {

                if (containsPosition(node, markerStartOffset)) {
                    if (isCStyle(node.fragments())) {
                        int dimensions = 0;

                        final List<?> fragments = node.fragments();
                        for (int i = 0, size = fragments.size(); i < size; i++) {
                            final VariableDeclaration decl = (VariableDeclaration) fragments.get(i);
                            if (decl.getExtraDimensions() > dimensions) {
                                dimensions = decl.getExtraDimensions();

                            }
                            decl.extraDimensions().clear();
                        }

                        // wrap current type into ArrayType
                        final ArrayType arrayType = createArrayType(node.getType(), dimensions);
                        node.setType(arrayType);

                    } else if (isJavaStyle(node.getType())) {

                        final List<?> fragments = node.fragments();
                        for (int i = 0, size = fragments.size(); i < size; i++) {
                            final VariableDeclaration decl = (VariableDeclaration) fragments.get(i);

                            decl.extraDimensions().clear();
                            for (int j = 0; j < ((ArrayType) node.getType()).getDimensions(); j++) {
                                decl.extraDimensions().add(decl.getAST().newDimension());
                            }
                        }

                        final Type elementType = (Type) ASTNode.copySubtree(node.getAST(),
                                ((ArrayType) node.getType()).getElementType());
                        node.setType(elementType);
                    }
                }
                return true;
            }

            @Override
            public boolean visit(SingleVariableDeclaration node) {

                if (containsPosition(node, markerStartOffset)) {
                    if (isCStyle(node)) {
                        // wrap the existing type into an array type
                        node.setType(createArrayType(node.getType(), node.getExtraDimensions()));
                        node.extraDimensions().clear();
                    } else if (isJavaStyle(node.getType())) {

                        final ArrayType arrayType = (ArrayType) node.getType();
                        final Type elementType = (Type) ASTNode.copySubtree(node.getAST(), arrayType.getElementType());

                        node.setType(elementType);
                        node.extraDimensions().clear();
                        for (int i = 0; i < arrayType.getDimensions(); i++) {
                            node.extraDimensions().add(node.getAST().newDimension());
                        }
                    }
                }

                return true;
            }

            @Override
            public boolean visit(FieldDeclaration node) {

                if (containsPosition(node, markerStartOffset)) {
                    if (isCStyle(node.fragments())) {
                        int dimensions = 0;

                        final List<?> fragments = node.fragments();
                        for (int i = 0, size = fragments.size(); i < size; i++) {
                            final VariableDeclaration decl = (VariableDeclaration) fragments.get(i);
                            if (decl.getExtraDimensions() > dimensions) {
                                dimensions = decl.getExtraDimensions();

                            }
                            decl.extraDimensions().clear();
                        }

                        // wrap current type into ArrayType
                        final ArrayType arrayType = createArrayType(node.getType(), dimensions);
                        node.setType(arrayType);
                    } else if (isJavaStyle(node.getType())) {
                        final List<?> fragments = node.fragments();
                        for (int i = 0, size = fragments.size(); i < size; i++) {
                            final VariableDeclaration decl = (VariableDeclaration) fragments.get(i);
                            decl.extraDimensions().clear();
                            for (int j = 0; j < ((ArrayType) node.getType()).getDimensions(); j++) {
                                decl.extraDimensions().add(decl.getAST().newDimension());
                            }
                        }

                        final Type elementType = (Type) ASTNode.copySubtree(node.getAST(),
                                ((ArrayType) node.getType()).getElementType());
                        node.setType(elementType);
                    }
                }
                return true;
            }

            private boolean isJavaStyle(Type type) {
                return type instanceof ArrayType;
            }

            private boolean isCStyle(VariableDeclaration decl) {
                return decl.getExtraDimensions() > 0;
            }

            private boolean isCStyle(List<?> fragments) {

                final Iterator<?> it = fragments.iterator();
                while (it.hasNext()) {
                    final VariableDeclaration decl = (VariableDeclaration) it.next();
                    if (isCStyle(decl)) {
                        return true;
                    }
                }
                return false;
            }

            private ArrayType createArrayType(Type componentType, int dimensions) {
                final Type type = (Type) ASTNode.copySubtree(componentType.getAST(), componentType);
                final ArrayType arrayType = componentType.getAST().newArrayType(type, dimensions);

                return arrayType;
            }
        };
    }
}
