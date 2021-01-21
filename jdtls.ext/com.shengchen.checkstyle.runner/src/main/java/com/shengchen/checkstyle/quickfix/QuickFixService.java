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

import com.shengchen.checkstyle.quickfix.blocks.AvoidNestedBlocksQuickFix;
import com.shengchen.checkstyle.quickfix.blocks.NeedBracesQuickFix;
import com.shengchen.checkstyle.quickfix.coding.DefaultComesLastQuickFix;
import com.shengchen.checkstyle.quickfix.coding.EmptyStatementQuickFix;
import com.shengchen.checkstyle.quickfix.coding.ExplicitInitializationQuickFix;
import com.shengchen.checkstyle.quickfix.coding.FinalLocalVariableQuickFix;
import com.shengchen.checkstyle.quickfix.coding.MissingSwitchDefaultQuickFix;
import com.shengchen.checkstyle.quickfix.coding.MultipleVariableDeclarationsQuickFix;
import com.shengchen.checkstyle.quickfix.coding.RequireThisQuickFix;
import com.shengchen.checkstyle.quickfix.coding.SimplifyBooleanReturnQuickFix;
import com.shengchen.checkstyle.quickfix.coding.StringLiteralEqualityQuickFix;
import com.shengchen.checkstyle.quickfix.design.DesignForExtensionQuickFix;
import com.shengchen.checkstyle.quickfix.design.FinalClassQuickFix;
import com.shengchen.checkstyle.quickfix.misc.ArrayTypeStyleQuickFix;
import com.shengchen.checkstyle.quickfix.misc.FinalParametersQuickFix;
import com.shengchen.checkstyle.quickfix.misc.UncommentedMainQuickFix;
import com.shengchen.checkstyle.quickfix.misc.UpperEllQuickFix;
import com.shengchen.checkstyle.quickfix.modifier.ModifierOrderQuickFix;
import com.shengchen.checkstyle.quickfix.modifier.RedundantModifierQuickFix;
import com.shengchen.checkstyle.quickfix.utils.EditUtils;
import com.shengchen.checkstyle.quickfix.whitepace.NewlineAtEndOfFileQuickFix;
import com.shengchen.checkstyle.quickfix.whitepace.NoWhitespaceAfterQuickFix;
import com.shengchen.checkstyle.quickfix.whitepace.NoWhitespaceBeforeQuickFix;
import com.shengchen.checkstyle.quickfix.whitepace.ParenPadQuickFix;
import com.shengchen.checkstyle.quickfix.whitepace.WhitespaceAfterQuickFix;
import com.shengchen.checkstyle.quickfix.whitepace.WhitespaceAroundQuickFix;
import com.shengchen.checkstyle.runner.api.IQuickFixService;

import org.eclipse.jdt.core.ICompilationUnit;
import org.eclipse.jdt.core.JavaModelException;
import org.eclipse.jdt.core.dom.ASTParser;
import org.eclipse.jdt.core.dom.CompilationUnit;
import org.eclipse.jdt.internal.corext.dom.IASTSharedValues;
import org.eclipse.jdt.ls.core.internal.JDTUtils;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.Document;
import org.eclipse.jface.text.IRegion;
import org.eclipse.lsp4j.WorkspaceEdit;
import org.eclipse.text.edits.MalformedTreeException;
import org.eclipse.text.edits.MultiTextEdit;
import org.eclipse.text.edits.TextEdit;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QuickFixService implements IQuickFixService {

    private final Map<String, IQuickFix> quickFixMap;

    public QuickFixService() {
        quickFixMap = new HashMap<>();
        quickFixMap.put(FixableCheck.FINAL_LOCAL_VARIABLE_CHECK.toString(), new FinalLocalVariableQuickFix());
        quickFixMap.put(FixableCheck.MODIFIER_ORDER_CHECK.toString(), new ModifierOrderQuickFix());
        quickFixMap.put(FixableCheck.REDUNDANT_MODIFIER_CHECK.toString(), new RedundantModifierQuickFix());
        quickFixMap.put(FixableCheck.NEED_BRACE_CHECK.toString(), new NeedBracesQuickFix());
        quickFixMap.put(FixableCheck.AVOID_NESTED_BLOCKS_CHECK.toString(), new AvoidNestedBlocksQuickFix());
        quickFixMap.put(FixableCheck.DESIGN_FOR_EXTENSION_CHECK.toString(), new DesignForExtensionQuickFix());
        quickFixMap.put(FixableCheck.FINAL_CLASS_CHECK.toString(), new FinalClassQuickFix());
        quickFixMap.put(FixableCheck.DEFAULT_COMES_LAST_CHECK.toString(), new DefaultComesLastQuickFix());
        quickFixMap.put(FixableCheck.EMPTY_STATEMENT_CHECK.toString(), new EmptyStatementQuickFix());
        quickFixMap.put(FixableCheck.MISSING_SWITCH_DEFAULT_CHECK.toString(), new MissingSwitchDefaultQuickFix());
        quickFixMap.put(FixableCheck.EXPLICIT_INITIALIZATION_CHECK.toString(), new ExplicitInitializationQuickFix());
        quickFixMap.put(FixableCheck.REQUIRE_THIS_CHECK.toString(), new RequireThisQuickFix());
        quickFixMap.put(FixableCheck.FINAL_PARAMETERS_CHECK.toString(), new FinalParametersQuickFix());
        quickFixMap.put(FixableCheck.UNCOMMENTED_MAIN_CHECK.toString(), new UncommentedMainQuickFix());
        quickFixMap.put(FixableCheck.UPPER_ELL_CHECK.toString(), new UpperEllQuickFix());
        quickFixMap.put(FixableCheck.ARRAY_TYPE_STYLE_CHECK.toString(), new ArrayTypeStyleQuickFix());
        quickFixMap.put(FixableCheck.SIMPLIFY_BOOLEAN_RETURN_CHECK.toString(), new SimplifyBooleanReturnQuickFix());
        quickFixMap.put(FixableCheck.STRING_LITERAL_EQUALITY.toString(), new StringLiteralEqualityQuickFix());
        quickFixMap.put(FixableCheck.MULTIPLE_VARIABLE_DECLARATIONS_CHECK.toString(), 
            new MultipleVariableDeclarationsQuickFix());
        quickFixMap.put(FixableCheck.PAREN_PAD_CHECK.toString(), new ParenPadQuickFix());
        quickFixMap.put(FixableCheck.WHITESPACE_AFTER_CHECK.toString(), new WhitespaceAfterQuickFix());
        quickFixMap.put(FixableCheck.WHITESPACE_AROUND_CHECK.toString(), new WhitespaceAroundQuickFix());
        quickFixMap.put(FixableCheck.NO_WHITESPACE_AFTER_CHECK.toString(), new NoWhitespaceAfterQuickFix());
        quickFixMap.put(FixableCheck.NO_WHITESPACE_BEFORE_CHECK.toString(), new NoWhitespaceBeforeQuickFix());
        quickFixMap.put(FixableCheck.NEWLINE_AT_END_OF_FILE_CHECK.toString(), new NewlineAtEndOfFileQuickFix());
    }

    public IQuickFix getQuickFix(String sourceName) {
        return quickFixMap.get(sourceName);
    }

    public WorkspaceEdit quickFix(
        String fileToCheckUri,
        List<Double> offsets,
        List<String> sourceNames
    ) throws JavaModelException, IllegalArgumentException, BadLocationException {
        final ICompilationUnit unit = JDTUtils.resolveCompilationUnit(fileToCheckUri);
        final Document document = new Document(unit.getSource());
        final ASTParser astParser = ASTParser.newParser(IASTSharedValues.SHARED_AST_LEVEL);
        astParser.setKind(ASTParser.K_COMPILATION_UNIT);
        astParser.setSource(unit);
        final CompilationUnit astRoot = (CompilationUnit) astParser.createAST(null);
        astRoot.recordModifications();

        final List<TextEdit> textEdits = new ArrayList<>();

        for (int i = 0; i < offsets.size(); i++) {
            final int offset = offsets.get(i).intValue();
            final IRegion lineInfo = document.getLineInformationOfOffset(offset);
            final IQuickFix quickFix = getQuickFix(sourceNames.get(i));
            if (quickFix instanceof BaseQuickFix) {
                astRoot.accept(((BaseQuickFix) quickFix).getCorrectingASTVisitor(lineInfo, offset));
            } else if (quickFix instanceof BaseEditQuickFix) {
                final TextEdit edit = ((BaseEditQuickFix) quickFix).createTextEdit(lineInfo, offset, document);
                if (edit != null) {
                    addAllEdits(edit, textEdits);
                }
            }
        }

        final MultiTextEdit result = (MultiTextEdit) astRoot.rewrite(document, null);
        for (final TextEdit anotherEdit : textEdits) {
            try {
                result.addChild(anotherEdit.copy());
            } catch (MalformedTreeException e) {
                /* Ignore text edits that can't be added; it is due to conflicts with an AST edit */
            }
        }
        return EditUtils.convertToWorkspaceEdit(unit, result);
    }

    private void addAllEdits(final TextEdit source, final List<TextEdit> dest) {
        for (final TextEdit anEdit : allEdits(source)) {
            if (canAddEdit(anEdit, dest)) {
                dest.add(anEdit);
            }
        }
    }

    /**
     * Check whether we can add the given new edit to our list of existing edits. This prevents
     * edits that might conflict or double-up.
     */
    private boolean canAddEdit(TextEdit edit, Collection<TextEdit> existingEdits) {
        for (final TextEdit existingEdit : existingEdits) {
            if (existingEdit instanceof MultiTextEdit) {
                if (!canAddEdit(edit, Arrays.asList(((MultiTextEdit) existingEdit).getChildren()))) {
                    return false;
                }
            } else {
                if (existingEdit.covers(edit) || existingEdit.getOffset() == edit.getOffset()) {
                    return false;
                }
            }
        }
        return true;
    }

    private Iterable<TextEdit> allEdits(TextEdit edit) {
        if (edit instanceof MultiTextEdit) {
            return Arrays.asList(((MultiTextEdit) edit).getChildren());
        } else {
            return Collections.singleton(edit);
        }
    }
}
