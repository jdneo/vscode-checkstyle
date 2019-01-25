import { AvailableQuickFix } from '../constants/quickFix';

export function isQuickFixAvailable(violationSourceName: string | number | undefined): boolean {
    if (violationSourceName && violationSourceName in AvailableQuickFix) {
        return true;
    }
    return false;
}
