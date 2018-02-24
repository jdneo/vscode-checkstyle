# Checkstyle extension for Visual Studio Code

[![Travis CI](https://travis-ci.org/jdneo/vscode-checkstyle.svg?branch=master)](https://travis-ci.org/jdneo/vscode-checkstyle)
[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version-short/shengchen.vscode-checkstyle.svg)](https://vsmarketplacebadge.apphb.com/version-short/shengchen.vscode-checkstyle.svg)
[![Gitter](https://badges.gitter.im/vscode-checkstyle/Lobby.svg)](https://gitter.im/vscode-checkstyle/Lobby)

## Prerequisites

* Please make sure ```Java``` is in system ```PATH```

## Settings
```
{
    // Specify whether the Checkstyle extension will check Java files automatically.
    "checkstyle.autocheck": false

    // Specify the Checkstyle version, or the local path to the checkstyle jar file.
    "checkstyle.version": "8.0",

    // Specify the checkstyle configuration file. You can use bundled ```google_checks``` or ```sun_checks```.
    // Or you can specify the local path to the configuration file.
    "checkstyle.configurationFile": "google_checks"
    
    // Specify the path to the checkstyle properties file, by default it's empty.
    "checkstyle.propertiesPath": ""

    // Show a warning if the version of Checkstyle is invalid.
    "checkstyle.showCheckstyleVersionInvalid": true
}
```

_If you want to use customized checkstyle configuration file, please make sure the checkstyle rules are compatible with the checkstyle version._


## Commands
This extension provides several commands in the Command Palette (F1 or Ctrl + Shift + P) for working with Java files:
* **Checkstyle: Check Code**: Check current active Java file with Checkstyle.
* **Checkstyle: Set Version**: Set the jar version for Checkstyle. Or you can specify \*.jar file local path of the checkstyle.
* **Checkstyle: Set Configuration**: Set the configuration file for Checkstyle.
* **Checkstyle: Set Properties**: Set the properties file for Checkstyle.
* **Checkstyle: Switch Automatic Checking**: Set whether the extension will run Checkstyle automatically.
* **Checkstyle: Open Output Channel**: Open the output channel for Checkstyle extension.

## Release Notes
Refer to [CHANGELOG](client/CHANGELOG.md)

## License
MIT