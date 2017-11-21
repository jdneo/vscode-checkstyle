/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as cp from 'child_process';

export namespace checkStyleCli {
    export async function exec(...args: string[]): Promise<string> {
        return await new Promise((resolve: (ret: string) => void): void => {
            const options: cp.SpawnOptions = {
                shell: true
            };
            const childProc: cp.ChildProcess = cp.spawn('java', args, options);

            let result: string = '';
            childProc.stdout.on('data', (data: string | Buffer) => {
                const input: string = data.toString();
                if (input.startsWith('<')) {
                    result += input;
                }
            });
            
            childProc.on('close', () => {
                resolve(result);
            });
        });
    }
}
