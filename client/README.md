# Checkstyle extension for Visual Studio Code

## Prerequisites

* Please make sure ```Java``` is in system ```PATH```

## Commands
This extension provides several commands in the Command Palette (F1 or Ctrl + Shift + P) for working with *.java files:
* **Checkstyle: Check code with Checkstyle**: Check current active Java file with Checkstyle.

## Options
```
{
    "checkstyle.enable": <boolean>
    "checkstyle.jarPath": "<string>",
    "checkstyle.configPath": "<string>"
    "checkstyle.propertiesPath": "<string>"
}
```

* ```checkstyle.enable``` - Specify the enable/disable status of checkstyle extension.
* ```checkstyle.jarPath``` - Path to the checkstyle jar file. By default, the extension will use [checkstyle-8.4-all.jar](https://sourceforge.net/projects/checkstyle/files/checkstyle/8.4/)
* ```checkstyle.configPath``` - Path to the checkstyle rule config file. By default, the extension will use [google_checks.xml](https://github.com/checkstyle/checkstyle/blob/master/src/main/resources/google_checks.xml)
* ```checkstyle.propertiesPath``` - Path to the checkstyle properties file. By default is empty. If a property file is specified, the system properties are ignored. See the [-p option in checkstyle doc](http://checkstyle.sourceforge.net/cmdline.html#Command_line_usage)

_If you want to use customized checkstyle config, please make sure the config rules are alignd with the checkstyle version._

## License
MIT