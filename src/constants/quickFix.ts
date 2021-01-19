// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

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
    MultipleVariableDeclarationsCheck = 'MultipleVariableDeclarationsCheck',

    // Design
    DesignForExtensionCheck = 'DesignForExtensionCheck',
    FinalClassCheck = 'FinalClassCheck',

    // Modifier
    ModifierOrderCheck = 'ModifierOrderCheck',
    RedundantModifierCheck = 'RedundantModifierCheck',

    // Whitespace
    ParenPadCheck = 'ParenPadCheck',

    // Misc
    FinalParametersCheck = 'FinalParametersCheck',
    UncommentedMainCheck = 'UncommentedMainCheck',
    UpperEllCheck = 'UpperEllCheck',
    ArrayTypeStyleCheck = 'ArrayTypeStyleCheck',
}
