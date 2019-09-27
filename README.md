# Checkstyle for VS Code

> Check your Java code format and fix it!

<p align="center">
  <img src="https://raw.githubusercontent.com/jdneo/vscode-checkstyle/master/resources/icon_checkstyle.png" alt="">
</p>
<p align="center">
  <a href="https://travis-ci.org/jdneo/vscode-checkstyle">
    <img src="https://img.shields.io/travis/jdneo/vscode-checkstyle.svg?style=flat-square" alt="">
  </a>
  <a href="https://lgtm.com/projects/g/jdneo/vscode-checkstyle/alerts">
    <img src="https://img.shields.io/lgtm/alerts/g/jdneo/vscode-checkstyle.svg?style=flat-square" alt="">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=shengchen.vscode-checkstyle">
    <img src="https://img.shields.io/visual-studio-marketplace/d/shengchen.vscode-checkstyle.svg?style=flat-square" alt="">
  </a>
  <a href="https://gitter.im/vscode-checkstyle/Lobby">
    <img src="https://img.shields.io/gitter/room/jdneo/vscode-checkstyle.svg?style=flat-square" alt="">
  </a>
</p>

> Note: Start from `1.0.0`, the extension is not back compatible with the previous version (before 0.5.2). Click [here](https://github.com/jdneo/vscode-checkstyle/tree/v0.5.2) if you want to check the previous documents.

## Requirements
- JDK (version 1.8.0 or later)
- VS Code (version 1.30.0 or later)
- [Language Support for Java by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.java)

## Quick Start
![demo](https://raw.githubusercontent.com/jdneo/vscode-checkstyle/master/docs/gifs/demo.gif)

## Features

### Set Checkstyle Version
<p align="center">
  <img src="https://raw.githubusercontent.com/jdneo/vscode-checkstyle/cs/1.3.0/docs/imgs/set_version.png" style="border-radius: 15px" alt="Set Checkstyle Configuration File" />
</p>

- You can use the command `Checkstyle: Set the Checkstyle Version` to manually set the Checkstyle version according to your project preferences. The extension will automatically download the required jar files if they do not exist locally.

### Set Checkstyle Configuration File
<p align="center">
  <img src="https://raw.githubusercontent.com/jdneo/vscode-checkstyle/master/docs/imgs/set_config.png" alt="Set Checkstyle Configuration File" />
</p>

- To set the configuration file, Just Right click the `.xml` file and select `Set the Checkstyle Configuration File`.

- You can also trigger the command **Checkstyle: Set Checkstyle Configuration File** to choose the configuration file in the File Explorer. The extension will automatically detect and list the Checkstyle configuration files in your workspace. Besides that, you will also see the two built-in configurations:
  - **Google's Check**
  - **Sun's Check**

### Check the Style and Fix the Violations
<p align="center">
  <img src="https://raw.githubusercontent.com/jdneo/vscode-checkstyle/master/docs/imgs/quick_fix.png" alt="Set Checkstyle Configuration File" />
</p>

- When opening or saving a Java file, the extension will check the file format and provide quick fixes if possible. You can click the ![bulb](https://raw.githubusercontent.com/jdneo/vscode-checkstyle/master/docs/imgs/btn_bulb.png) button in the editor to show the available quick fixes.

## Settings
| Setting Name | Description | Default Value |
|---|---|---|
| `java.checkstyle.configuration` | Specify the path of the Checkstyle configuration file. The path can either be a local file path or a URL. | `""` |
| `java.checkstyle.properties` | Specify the customized properties used in the Checkstyle configuration. | `{}` |
| `java.checkstyle.autocheck` | Specify if the extension will check the format automatically or not. | `true` |

> Note: You can use the `${workspaceFolder}` to represent the path of the workspace folder of the file to be checked. For example: 

```javascript
"java.checkstyle.properties": {
    "basedir": "${workspaceFolder}"
}
```

## Release Notes

Refer to [CHANGELOG.md](https://github.com/jdneo/vscode-checkstyle/blob/master/CHANGELOG.md)
