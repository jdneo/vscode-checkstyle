package com.shengchen.checkstyle.runner.quickfix;

public enum FixableCheck {
    FINAL_LOCAL_VARIABLE_CHECK("FinalLocalVariableCheck"), MODIFIER_ORDER_CHECK("ModifierOrderCheck"),
    REDUNDANT_MODIFIER_CHECK("RedundantModifierCheck");

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
