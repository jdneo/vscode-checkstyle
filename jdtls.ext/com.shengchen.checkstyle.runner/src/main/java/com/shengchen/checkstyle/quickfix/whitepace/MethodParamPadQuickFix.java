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
import org.eclipse.text.edits.InsertEdit;
import org.eclipse.text.edits.TextEdit;

/**
 * Quick fix for
 * https://checkstyle.org/apidocs/com/puppycrawl/tools/checkstyle/checks/whitespace/MethodParamPadCheck.html
 */
public class MethodParamPadQuickFix extends BaseEditQuickFix {

    @Override
    public TextEdit createTextEdit(IRegion lineInfo, int markerStartOffset, String violationKey, Document doc) {
        try {
            final int fromStartOfLine = markerStartOffset - lineInfo.getOffset();
            final String string = doc.get(lineInfo.getOffset(), lineInfo.getLength());
            
            if ("ws.notPreceded".equals(violationKey)) {
                return new InsertEdit(markerStartOffset, " ");
            } else if ("ws.preceded".equals(violationKey)) {
                final int tokenLength = measureTokenBackwards(string, fromStartOfLine - 1, Character::isWhitespace);
                if (tokenLength > 0) {
                    return new DeleteEdit(markerStartOffset - tokenLength, tokenLength);
                }
            }

            return null;
        } catch (BadLocationException e) {
            return null;
        }
    }

}
