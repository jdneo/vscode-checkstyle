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
import org.eclipse.text.edits.DeleteEdit;
import org.eclipse.text.edits.TextEdit;

public class ParenPadQuickFix extends BaseEditQuickFix {

    @Override
    public TextEdit createTextEdit(IRegion lineInfo, int markerStartOffset, Document doc) {
        try {
            final int fromStartOfLine = markerStartOffset - lineInfo.getOffset();
            final char marker = doc.getChar(markerStartOffset);
            if (marker == '(') {
                final String string = doc.get(markerStartOffset + 1, lineInfo.getLength() - fromStartOfLine - 1);
                final int leadingWhitespace = measureLeadingWhitespace(string);
                if (leadingWhitespace > 0) {
                    return new DeleteEdit(markerStartOffset + 1, leadingWhitespace);
                }
            } else if (marker == ')' && fromStartOfLine > 0) {
                final String string = doc.get(lineInfo.getOffset(), fromStartOfLine);
                final int trailingWhitespace = measureTrailingWhitespace(string);
                if (trailingWhitespace > 0) {
                    return new DeleteEdit(markerStartOffset - trailingWhitespace, trailingWhitespace);
                }
            }

            return null;
        } catch (BadLocationException e) {
            return null;
        }
    }

    private int measureLeadingWhitespace(String string) {
        final int n = string.length();
        for (int i = 0; i < n; i++) {
            if (!Character.isWhitespace(string.charAt(i))) {
                return i;
            }
        }
        return n;
    }

    private int measureTrailingWhitespace(String string) {
        final int n = string.length();
        for (int i = n - 1; i >= 0; i--) {
            if (!Character.isWhitespace(string.charAt(i))) {
                return n - 1 - i;
            }
        }
        return n;
    }

}
