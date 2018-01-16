'use strict';

import { IUserInterface } from '../IUserInterface';
import { VSCodeUI } from '../VSCodeUI';
import { updateSettings } from './common/updateSettings';

export async function setCheckstyleProperties(ui: IUserInterface = new VSCodeUI()): Promise<void> {
    const result: string = await ui.showFolderDialog();
    await updateSettings(new Map([['propertiesPath', result]]), ui);
}
