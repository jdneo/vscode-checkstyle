'use strict';

import * as cp from 'child_process';
import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { ConfigurationType, ICheckStyleSettings } from './checkstyleSetting';
import { InvalidVersionError, VersionNotExistError } from './errors';

export namespace checker {

    export const resourcesPath: string = path.join(os.homedir(), '.vscode', 'vscode-checkstyle', 'resources');

    export async function checkstyle(settings: ICheckStyleSettings, sourcePath: string, force?: boolean): Promise<string | undefined> {
        const jarPath: string = await ensureJarFileParam(settings.version);
        const configPath: string = await ensureConfigurationFileParam(settings.configurationFile);
        if (settings.autocheck || force) {
            const checkstyleParams: string[] = [
                '-jar',
                jarPath,
                '-c',
                configPath
            ];
            if (settings.propertiesPath) {
                checkstyleParams.push('-p', settings.propertiesPath);
            }
            checkstyleParams.push(sourcePath);
            return await exec(...checkstyleParams);
        }
        return undefined;
    }

    async function ensureJarFileParam(jar: string): Promise<string> {
        // test version format
        if (/^\d\.\d{1,2}(?:\.\d)?$/.test(jar)) {
            const jarPath: string = path.join(resourcesPath, `checkstyle-${jar}-all.jar`);
            if (await fse.pathExists(jarPath)) {
                return jarPath;
            }
            throw new VersionNotExistError(jar);
        }

        // test file path format
        if (await fse.pathExists(jar)) {
            return jar;
        }

        throw new InvalidVersionError();
    }

    async function ensureConfigurationFileParam(config: string): Promise<string> {
        switch (config.toLowerCase()) {
            case ConfigurationType.GoogleChecks:
            case ConfigurationType.SunChecks:
                return `/${config.toLowerCase()}.xml`;
            default:
                if (await fse.pathExists(config)) {
                    return config;
                } else {
                    throw new Error(`The configuration file ${config} does not exist`);
                }
        }
    }

    async function exec(...args: string[]): Promise<string> {
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
                if (result && !error) {
                    resolve(result);
                } else {
                    reject(new Error(`Command failed with exit code: ${code}. Stderr: ${error}`));
                }
            });
        });
    }
}
