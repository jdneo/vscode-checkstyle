package com.shengchen.checkstyle.runner;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;
import com.shengchen.checkstyle.runner.quickfix.FinalLocalVariableQuickFix;
import com.shengchen.checkstyle.runner.quickfix.FixableCheck;
import com.shengchen.checkstyle.runner.quickfix.modifier.ModifierOrderQuickFix;
import com.shengchen.checkstyle.runner.quickfix.modifier.RedundantModifierQuickFix;

import java.util.HashMap;
import java.util.Map;

public class QuickFixProvider {
    private static final Map<String, BaseQuickFix> quickFixMap;

    static {
        quickFixMap = new HashMap<>();
        quickFixMap.put(FixableCheck.FINAL_LOCAL_VARIABLE_CHECK.toString(), new FinalLocalVariableQuickFix());
        quickFixMap.put(FixableCheck.MODIFIER_ORDER_CHECK.toString(), new ModifierOrderQuickFix());
        quickFixMap.put(FixableCheck.REDUNDANT_MODIFIER_CHECK.toString(), new RedundantModifierQuickFix());
    }

    public static BaseQuickFix getQuickFix(String sourceName) {
        return quickFixMap.get(sourceName);
    }
}
