package com.shengchen.checkstyle.runner;

import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;
import com.shengchen.checkstyle.runner.quickfix.FixableCheck;
import com.shengchen.checkstyle.runner.quickfix.blocks.AvoidNestedBlocksQuickFix;
import com.shengchen.checkstyle.runner.quickfix.blocks.NeedBracesQuickFix;
import com.shengchen.checkstyle.runner.quickfix.coding.DefaultComesLastQuickFix;
import com.shengchen.checkstyle.runner.quickfix.coding.EmptyStatementQuickFix;
import com.shengchen.checkstyle.runner.quickfix.coding.ExplicitInitializationQuickFix;
import com.shengchen.checkstyle.runner.quickfix.coding.FinalLocalVariableQuickFix;
import com.shengchen.checkstyle.runner.quickfix.coding.MissingSwitchDefaultQuickFix;
import com.shengchen.checkstyle.runner.quickfix.coding.RequireThisQuickFix;
import com.shengchen.checkstyle.runner.quickfix.coding.SimplifyBooleanReturnQuickFix;
import com.shengchen.checkstyle.runner.quickfix.coding.StringLiteralEqualityQuickFix;
import com.shengchen.checkstyle.runner.quickfix.design.DesignForExtensionQuickFix;
import com.shengchen.checkstyle.runner.quickfix.design.FinalClassQuickFix;
import com.shengchen.checkstyle.runner.quickfix.misc.ArrayTypeStyleQuickFix;
import com.shengchen.checkstyle.runner.quickfix.misc.FinalParametersQuickFix;
import com.shengchen.checkstyle.runner.quickfix.misc.UncommentedMainQuickFix;
import com.shengchen.checkstyle.runner.quickfix.misc.UpperEllQuickFix;
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
    }

    public static BaseQuickFix getQuickFix(String sourceName) {
        return quickFixMap.get(sourceName);
    }
}
