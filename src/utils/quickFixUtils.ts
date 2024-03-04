// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { FixableCheck } from '../constants/quickFix';

export function isQuickFixAvailable(violationSourceName: any): boolean {
  if (violationSourceName && violationSourceName in FixableCheck) {
    return true;
  }
  return false;
}
