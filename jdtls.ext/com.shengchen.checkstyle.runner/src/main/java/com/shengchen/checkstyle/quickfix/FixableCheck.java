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

public enum FixableCheck {
    // Blocks
    NEED_BRACE_CHECK("NeedBracesCheck"), AVOID_NESTED_BLOCKS_CHECK("AvoidNestedBlocksCheck"),

    // Coding
    FINAL_LOCAL_VARIABLE_CHECK("FinalLocalVariableCheck"), DEFAULT_COMES_LAST_CHECK("DefaultComesLastCheck"),
    EMPTY_STATEMENT_CHECK("EmptyStatementCheck"), MISSING_SWITCH_DEFAULT_CHECK("MissingSwitchDefaultCheck"),
    EXPLICIT_INITIALIZATION_CHECK("ExplicitInitializationCheck"), REQUIRE_THIS_CHECK("RequireThisCheck"),
    SIMPLIFY_BOOLEAN_RETURN_CHECK("SimplifyBooleanReturnCheck"), STRING_LITERAL_EQUALITY("StringLiteralEqualityCheck"),
    MULTIPLE_VARIABLE_DECLARATIONS_CHECK("MultipleVariableDeclarationsCheck"),

    // Design
    DESIGN_FOR_EXTENSION_CHECK("DesignForExtensionCheck"), FINAL_CLASS_CHECK("FinalClassCheck"),

    // Modifier
    MODIFIER_ORDER_CHECK("ModifierOrderCheck"), REDUNDANT_MODIFIER_CHECK("RedundantModifierCheck"),

    // Whitespace
    PAREN_PAD_CHECK("ParenPadCheck"),
    WHITESPACE_AFTER_CHECK("WhitespaceAfterCheck"),
    WHITESPACE_AROUND_CHECK("WhitespaceAroundCheck"),
    NO_WHITESPACE_AFTER_CHECK("NoWhitespaceAfterCheck"),
    NO_WHITESPACE_BEFORE_CHECK("NoWhitespaceBeforeCheck"),
    NEWLINE_AT_END_OF_FILE_CHECK("NewlineAtEndOfFileCheck"),
    GENERIC_WHITESPACE_CHECK("GenericWhitespaceCheck"),
    METHOD_PARAM_PAD_CHECK("MethodParamPadCheck"),

    // Misc
    FINAL_PARAMETERS_CHECK("FinalParametersCheck"), UNCOMMENTED_MAIN_CHECK("UncommentedMainCheck"),
    UPPER_ELL_CHECK("UpperEllCheck"), ARRAY_TYPE_STYLE_CHECK("ArrayTypeStyleCheck");

    private final String check;

    FixableCheck(final String check) {
        this.check = check;
    }

    /*
     * (non-Javadoc)
     *
     * @see java.lang.Enum#toString()
     */
    @Override
    public String toString() {
        return check;
    }
}
