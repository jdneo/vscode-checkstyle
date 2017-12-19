'use strict';

export interface ICheckStyleSettings {
    autocheck: boolean;
    version: string;
    configurationFile: string;
    propertiesPath: string;
}

export enum ConfigurationType {
    GoogleChecks = 'google_checks',
    SunChecks = 'sun_checks'
}

export const DEFAULT_SETTINGS: ICheckStyleSettings = {
    autocheck: false,
    version: '8.0',
    configurationFile: ConfigurationType.GoogleChecks,
    propertiesPath: undefined
};
