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

import org.eclipse.jface.text.Document;
import org.eclipse.jface.text.IRegion;
import org.eclipse.text.edits.TextEdit;

import java.util.function.Predicate;

public abstract class BaseEditQuickFix implements IQuickFix {
    
    public abstract TextEdit createTextEdit(IRegion lineInfo, int markerStartOffset, String violationKey, Document doc);

    protected int measureToken(String string, Predicate<Character> tokenPredicate) {
        return measureToken(string, 0, tokenPredicate);
    }

    protected int measureToken(String string, int from, Predicate<Character> tokenPredicate) {
        final int n = string.length();
        for (int i = from; i < n; i++) {
            if (!tokenPredicate.test(string.charAt(i))) {
                return i - from;
            }
        }
        return n - from;
    }

    protected int measureTokenBackwards(String string, Predicate<Character> tokenPredicate) {
        return measureTokenBackwards(string, -1, tokenPredicate);
    }

    protected int measureTokenBackwards(String string, int from, Predicate<Character> tokenPredicate) {
        final int n = string.length();
        if (from == -1) {
            from = n - 1;
        }
        for (int i = from; i >= 0; i--) {
            if (!tokenPredicate.test(string.charAt(i))) {
                return from - i;
            }
        }
        return from + 1;
    }
    
}
