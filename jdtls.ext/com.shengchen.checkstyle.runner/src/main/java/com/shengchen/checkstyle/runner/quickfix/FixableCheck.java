package com.shengchen.checkstyle.runner.quickfix;

public enum FixableCheck {
    // Blocks
    NEED_BRACE_CHECK("NeedBracesCheck"), AVOID_NESTED_BLOCKS_CHECK("AvoidNestedBlocksCheck"),

    // Coding
    FINAL_LOCAL_VARIABLE_CHECK("FinalLocalVariableCheck"), DEFAULT_COMES_LAST_CHECK("DefaultComesLastCheck"),
    EMPTY_STATEMENT_CHECK("EmptyStatementCheck"), MISSING_SWITCH_DEFAULT_CHECK("MissingSwitchDefaultCheck"),
    EXPLICIT_INITIALIZATION_CHECK("ExplicitInitializationCheck"),

    // Design
    DESIGN_FOR_EXTENSION_CHECK("DesignForExtensionCheck"), FINAL_CLASS_CHECK("FinalClassCheck"),

    // Modifier
    MODIFIER_ORDER_CHECK("ModifierOrderCheck"), REDUNDANT_MODIFIER_CHECK("RedundantModifierCheck");

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
