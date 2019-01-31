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

    // Design
    DesignForExtensionCheck = 'DesignForExtensionCheck',
    FinalClassCheck = 'FinalClassCheck',

    // Modifier
    ModifierOrderCheck = 'ModifierOrderCheck',
    RedundantModifierCheck = 'RedundantModifierCheck',
}
