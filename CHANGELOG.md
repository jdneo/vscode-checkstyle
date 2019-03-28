# Change Log
All notable changes to the "vscode-checkstyle" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.3]
## Fixed
- Fix vulnerability issues. ([PR#170](https://github.com/jdneo/vscode-checkstyle/pull/170))

## [1.0.2]
## Fixed
- Fixed the java extension version.

## [1.0.1]
## Changed
- Upgrade the embedded Checkstyle version to 8.18.

## Fixed
- [Bug fixed](https://github.com/jdneo/vscode-checkstyle/issues?q=is%3Aissue+is%3Aclosed+milestone%3A1.0.1+label%3Abug)

## [1.0.0]
Initial release for the new Checkstyle extension, the new extension contains following features:
- Check code with Checkstyle.
- Provide quick fix if it's available.

## [0.5.2]
## Fixed
- Fixed some bugs.

## [0.5.1]
## Fixed
- Disable Checkstyle commands appear in the context menu of output panel. ([#118](https://github.com/jdneo/vscode-checkstyle/issues/118))
- Download Checkstyle jars from Github. ([#120](https://github.com/jdneo/vscode-checkstyle/issues/120))

## [0.5.0]
### Added
- Support clean Checkstyle Violation through Command Palette/File Explorer/Editor. ([#104](https://github.com/jdneo/vscode-checkstyle/issues/104))
- Support check code through File Explorer/Editor. ([#108](https://github.com/jdneo/vscode-checkstyle/issues/108))

## [0.4.1]
### Fixed
- Fix a potential security vulnerability. ([#100](https://github.com/jdneo/vscode-checkstyle/issues/100))

## [0.4.0]
### Added
- Add 'don't warn again' option when invalid CheckStyle version warning pops up. ([#80](https://github.com/jdneo/vscode-checkstyle/pull/80))

### Changed
- Change status bar icon functionalities. ([#78](https://github.com/jdneo/vscode-checkstyle/pull/78))
- User can open the Checkstyle download page when downloading fails. ([#79](https://github.com/jdneo/vscode-checkstyle/pull/79))
- Change command name. ([#93](https://github.com/jdneo/vscode-checkstyle/pull/93))

## [0.3.1]
### Changed
- Won't open the output channel automatically when error occurs. ([#74](https://github.com/jdneo/vscode-checkstyle/issues/74))

### Fixed
- Fix the property resolve bug. ([#75](https://github.com/jdneo/vscode-checkstyle/issues/75))

## [0.3.0]
### Added
- Add support to automatically resolve properties in the Checkstyle configuration file.

### Fixed
- Fix argument contains whitespace error. ([#61](https://github.com/jdneo/vscode-checkstyle/issues/61))

## [0.2.0]
### Added
- Add support to automatically resolve and download Checkstyle.
- Add status icon in status bar.
- Add setting autocheck command into command palette.
- Add setting property file command into command palette.

### Changed
- Turn off ```autocheck``` by default.
- User Cancel Action will not pop up error message any more.

## [0.1.1]
### Fixed
- Fix line must be positive error. ([#31](https://github.com/jdneo/vscode-checkstyle/issues/31))

## [0.1.0]
### Added
- Add support changing Checkstyle jar file and configuration through commands.
- Add the ability to download Checkstyle 8.0 for the first time run.
- Add setting ```checkstyle.autocheck```.

### Fixed
- Fix the issue that the checkstyle output may not be correctly parsed. 