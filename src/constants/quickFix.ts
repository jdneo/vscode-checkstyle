export enum FixableCheck {
    // Blocks
    NeedBracesCheck = 'NeedBracesCheck',
    AvoidNestedBlocksCheck = 'AvoidNestedBlocksCheck',

    // Coding
    DefaultComesLastCheck = 'DefaultComesLastCheck',
    FinalLocalVariableCheck = 'FinalLocalVariableCheck',
    EmptyStatementCheck = 'EmptyStatementCheck',
    MissingSwitchDefaultCheck = 'MissingSwitchDefaultCheck',
    ExplicitInitializationCheck = 'ExplicitInitializationCheck',
    RequireThisCheck = 'RequireThisCheck',
    SimplifyBooleanReturnCheck = 'SimplifyBooleanReturnCheck',
    StringLiteralEqualityCheck = 'StringLiteralEqualityCheck',

    // Design
    DesignForExtensionCheck = 'DesignForExtensionCheck',
    FinalClassCheck = 'FinalClassCheck',

    // Modifier
    ModifierOrderCheck = 'ModifierOrderCheck',
    RedundantModifierCheck = 'RedundantModifierCheck',

    // Misc
    FinalParametersCheck = 'FinalParametersCheck',
    UncommentedMainCheck = 'UncommentedMainCheck',
    UpperEllCheck = 'UpperEllCheck',
    ArrayTypeStyleCheck = 'ArrayTypeStyleCheck',
}
