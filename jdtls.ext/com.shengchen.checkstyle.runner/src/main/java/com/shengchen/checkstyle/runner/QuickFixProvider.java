package com.shengchen.checkstyle.runner;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;
import com.shengchen.checkstyle.runner.quickfix.FinalLocalVariableQuickFix;
import com.shengchen.checkstyle.runner.quickfix.modifier.ModifierOrderQuickFix;

import java.util.HashMap;
import java.util.Map;

public class QuickFixProvider {
    private static final Map<String, BaseQuickFix> quickFixMap;

    static {
        quickFixMap = new HashMap<>();
        quickFixMap.put("FinalLocalVariableCheck", new FinalLocalVariableQuickFix());
        quickFixMap.put("ModifierOrderCheck", new ModifierOrderQuickFix());
    }

    public static BaseQuickFix getQuickFix(String sourceName) {
        return quickFixMap.get(sourceName);
    }
}
