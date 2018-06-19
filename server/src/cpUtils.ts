'use strict';

import * as cp from 'child_process';

export namespace cpUtils {
    export async function exec(command: string, args: string[], options?: cp.SpawnOptions): Promise<string> {
        return await new Promise((resolve: (ret: string) => void, reject: (e: Error) => void): void => {
            if (!options) {
                options = { shell: true };
            }
            const childProc: cp.ChildProcess = cp.spawn(command, args, options);

            let result: string = '';
            let error: string = '';
            childProc.stdout.on('data', (data: string | Buffer) => result += data.toString());
            childProc.stderr.on('data', (data: string | Buffer) => error += data.toString());

            childProc.on('close', (code: number) => {
                if (result && !error) {
                    resolve(result);
                } else {
                    reject(new Error(`Command failed with exit code: ${code}. Stderr: ${error}`));
                }
            });
        });
    }
}
