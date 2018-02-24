# Change Log

## [0.4.0]
### Added
- Add 'don't warn again' option when invalid CheckStyle version warning pops up. ([#80](https://github.com/jdneo/vscode-checkstyle/pull/80))

### Changed
- Change status bar icon functionalities. ([#78](https://github.com/jdneo/vscode-checkstyle/pull/78))
- User can open the Checkstyle download page when downloading fails. ([#79](https://github.com/jdneo/vscode-checkstyle/pull/79))

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