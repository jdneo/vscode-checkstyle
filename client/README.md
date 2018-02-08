# Checkstyle extension for Visual Studio Code

## Prerequisites

* Please make sure ```Java``` is in system ```PATH```

## Options
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
}
```

_If you want to use customized checkstyle configuration file, please make sure the checkstyle rules are compatible with the checkstyle version._


## Commands
This extension provides several commands in the Command Palette (F1 or Ctrl + Shift + P) for working with Java files:
* **Checkstyle: Check code with Checkstyle**: Check current active Java file with Checkstyle.
* **Checkstyle: Set the Checkstyle version**: Set the jar version for Checkstyle. Or you can specify \*.jar file local path of the checkstyle.
* **Checkstyle: Set Checkstyle configuration file path**: Set the configuration file for Checkstyle.
* **Checkstyle: Set Checkstyle properties file**: Set the properties file for Checkstyle.
* **Checkstyle: Turn on/off checking code with Checkstyle automatically**: Set whether the extension will run Checkstyle automatically.

## Release Notes
Refer to [CHANGELOG](CHANGELOG.md)

## License
MIT