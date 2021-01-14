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

package com.shengchen.checkstyle.quickfix.whitepace;

import com.shengchen.checkstyle.quickfix.BaseEditQuickFix;

import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.Document;
import org.eclipse.jface.text.IRegion;
import org.eclipse.text.edits.InsertEdit;
import org.eclipse.text.edits.MultiTextEdit;
import org.eclipse.text.edits.TextEdit;

import java.util.function.Predicate;

public class WhitespaceAroundQuickFix extends BaseEditQuickFix {

    private static final String OPERATORS = "-=!&|^<>";

    @Override
    public TextEdit createTextEdit(IRegion lineInfo, int markerStartOffset, Document doc) {
        try {
            final int fromStartOfLine = markerStartOffset - lineInfo.getOffset();
            final String string = doc.get(lineInfo.getOffset(), lineInfo.getLength());
            
            final char marker = string.charAt(fromStartOfLine);
            final int tokenLength;

            if (marker == '{' || marker == '}') {
                tokenLength = 1;
            } else if (OPERATORS.indexOf(marker) != -1) {
                tokenLength = measureToken(string, c -> OPERATORS.indexOf(c) != -1);
            } else if (Character.isLetter(marker)) {
                /* Literal if, else, while, do, for */
                tokenLength  = measureToken(string, Character::isLetter);
            } else {
                tokenLength = 0;
            }

            if (tokenLength > 0) {
                final MultiTextEdit result = new MultiTextEdit();
                if (fromStartOfLine > 0 && !Character.isWhitespace(string.charAt(fromStartOfLine - 1))) {
                    result.addChild(new InsertEdit(lineInfo.getOffset() + fromStartOfLine, " "));
                }
                if (fromStartOfLine + tokenLength < string.length() && 
                    !Character.isWhitespace(string.charAt(fromStartOfLine + tokenLength))) {
                    result.addChild(new InsertEdit(lineInfo.getOffset() + fromStartOfLine + tokenLength, " "));
                }
                return result;
            }

            return null;
        } catch (BadLocationException e) {
            return null;
        }
    }

    private int measureToken(String string, Predicate<Character> tokenPredicate) {
        final int n = string.length();
        for (int i = 0; i < n; i++) {
            if (!tokenPredicate.test(string.charAt(i))) {
                return i;
            }
        }
        return n;
    }

}
