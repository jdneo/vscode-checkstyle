import { FixableCheck } from '../constants/quickFix';

export function isQuickFixAvailable(violationSourceName: string | number | undefined): boolean {
    if (violationSourceName && violationSourceName in FixableCheck) {
        return true;
    }
    return false;
}
