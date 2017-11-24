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
                if (result) {
                    result = result.slice(result.indexOf('<?xml'), result.lastIndexOf('</checkstyle>') + '</checkstyle>'.length);
                    resolve(result);
                } else {
                    reject(new Error(`Command failed with exit code: ${code}. Stderr: ${error}`));
                }
            });
        });
    }
}
