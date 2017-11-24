/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as cp from 'child_process';

export namespace checker {
    export async function exec(...args: string[]): Promise<string> {
        return await new Promise((resolve: (ret: string) => void, reject: (e: Error) => void): void => {
            const options: cp.SpawnOptions = {
                shell: true
            };
            const childProc: cp.ChildProcess = cp.spawn('java', args, options);

            let result: string = '';
            let error: string = '';
            childProc.stdout.on('data', (data: string | Buffer) => result += data.toString());
            childProc.stderr.on('data', (data: string | Buffer) => error += data.toString());

            childProc.on('close', (code: number) => {
                if (code !== 0) {
                    reject(new Error(`Command failed with exit code: ${code}. Stderr: ${error}`));
                } else {
                    resolve(result);
                }
            });

            childProc.on('error', reject);
        });
    }
}
