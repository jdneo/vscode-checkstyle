# Checkstyle extension for Visual Studio Code

[![Travis CI](https://travis-ci.org/jdneo/vscode-checkstyle.svg?branch=master)](https://travis-ci.org/jdneo/vscode-checkstyle) [![Marketplace Version](https://vsmarketplacebadge.apphb.com/version-short/shengchen.vscode-checkstyle.svg)](https://vsmarketplacebadge.apphb.com/version-short/shengchen.vscode-checkstyle.svg)

## Prerequisites

* Please make sure ```Java``` is in system ```PATH```

## Options
```
{
    "checkstyle.jarPath": "[file path to the checkstyle jar file]",
    "checkstyle.configPath": "[file path to the checkstyle rule config file]"
}
```

* ```checkstyle.jarPath``` - Path to the checkstyle jar file. By default, the extension will use [checkstyle-8.4-all.jar](https://sourceforge.net/projects/checkstyle/files/checkstyle/8.4/)
* ```checkstyle.configPath``` - Path to the checkstyle rule config file. By default, the extension will use [google_checks.xml](https://github.com/checkstyle/checkstyle/blob/master/src/main/resources/google_checks.xml)

_If you want to use customized checkstyle config, please make sure the config rules are alignd with the checkstyle version._

## License
MIT