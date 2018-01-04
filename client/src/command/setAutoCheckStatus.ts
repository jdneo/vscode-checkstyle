'use strict';

import { IUserInterface, PickWithData } from '../IUserInterface';
import { VSCodeUI } from '../VSCodeUI';
import { updateSettings } from './common/updateSettings';

export async function setAutoCheckStatus(ui: IUserInterface = new VSCodeUI()): Promise<void> {
    const statusPicks: PickWithData<boolean>[] = [
        new PickWithData<boolean>(true, '$(check) On'),
        new PickWithData<boolean>(false, '$(x) Off')
    ];
    const status: boolean = (await ui.showQuickPick(statusPicks, 'Select the autocheck status')).data;
    await updateSettings(new Map([['autocheck', status]]), ui);
}
