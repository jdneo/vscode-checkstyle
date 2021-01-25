# Contributing Guide

Thank you for your interest in contributing to this extension!

There are many ways in which you can contribute, beyond writing code. Please read the following document to check how you can get involved.

## Questions and Feedback
Have questions or feedback? Feel free to let us know! You can share your thoughts in our Gitter channel: [![Gitter](https://badges.gitter.im/jdneo/vscode-checkstyle.svg)](https://gitter.im/vscode-checkstyle/Lobby)

## Reporting Issues
You can report issues whenever:
- Identify a reproducible problem within the extension
- Have a feature request

### Looking for an Existing Issue
Before creating a new issue, please do a search to see if the issue or feature request has already been filed.

If you find your issue already exists, make relevant comments and add your reaction:
- 👍 - upvote
- 👎 - downvote
 
### Writing Good Bug Reports and Feature Requests
In order to let us know better about the issue, please make sure the following items are included with each issue:
- The version of VS Code
- Your operating system
- Reproducible steps
- What you expected to see, versus what you actually saw
- Images, animations, or a link to a video showing the issue occurring
- A code snippet that demonstrates the issue or a link to a code repository the developers can easily pull down to recreate the issue locally
- Errors from the Dev Tools Console (open from the menu: Help > Toggle Developer Tools)
 
## Contributing Fixes
If you are interested in writing code to fix issues, please check the following content to see how to set up the developing environment.

### Overview
The extension has three major modules, which are listed as follow:
- The extension client written in TypeScript - UI logic mostly
- [The Checkstyle checker](https://github.com/jdneo/vscode-checkstyle/tree/master/jdtls.ext/com.shengchen.checkstyle.checker) written in Java - Interact with the Checkstyle's tooling API. 
- [The Checkstyle runner](https://github.com/jdneo/vscode-checkstyle/tree/master/jdtls.ext/com.shengchen.checkstyle.runner) written in Java - The OSGi bundle loaded into the Java Language Server and interact with the extension client.

### Setup
0. Make sure you have JDK 8, Node.js, VS Code and [Java Extension Pack](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) installed.
1. Fork and clone the repository: `git clone https://github.com/jdneo/vscode-checkstyle.git`
2. `cd vscode-checkstyle`
3. Install the node dependencies: `npm install`
4. Build the Java modules: `npm run build-plugin`
6. Open the directory `vscode-checkstyle` in VS Code
7. Install the [Eclipse PDE Support extension](https://marketplace.visualstudio.com/items?itemName=yaozheng.vscode-pde) in your VS Code
8. Open a Java file and wait until 👍 shows in the right-bottom of the status bar
    > Note: Sometimes, if you find the code navigation is not working in the Java code, please try: 
    > - right click the [target.target](https://github.com/jdneo/vscode-checkstyle/blob/master/jdtls.ext/com.shengchen.checkstyle.runner/target.target) file and select `Reload Target Platform`.
    > - Reload your VS Code.

### Debugging
1. Hit `F5` (or run `Launch Extension` in the debug viewlet) to launch the extension in debug mode
    > This will open a new VS Code window as a debug session. Open a Java project folder and let the extension be activated, then you can debug it.
2. If you want to debug the Checkstyle runner, run [Attach to Checkstyle Plugin](https://github.com/jdneo/vscode-checkstyle/blob/master/.vscode/launch.json) in the debug viewlet.

> Note: If the Java code is changed by you, please run `npm run build-plugin` before you start debugging, the output jars will be generated in the folder `server/`. Or you can use the [HCR](https://code.visualstudio.com/docs/java/java-debugging#_hot-code-replacement) feature provided by the VS Code Java Debugger extension.

### Build Your Own Private Build
If you want to build and install your own private build:

```shell
npm run build-plugin
npx vsce@latest package
code --install-extension vscode-checkstyle-*.vsix
```

### Check Linting Errors:
Run `npm run lint` to check linting errors.