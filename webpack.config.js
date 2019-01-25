//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
    // 📖 -> https://webpack.js.org/configuration/node/
    node: {
        __dirname: false,
        __filename: false,
    },
    // 📖 -> https://webpack.js.org/configuration/entry-context/
    entry: './src/extension.ts',
    // 📖 -> https://webpack.js.org/configuration/output/
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    externals: {
        // 📖 -> https://webpack.js.org/configuration/externals/
        vscode: "commonjs vscode",
    },
    devtool: 'source-map',
    // 📖 -> https://github.com/TypeStrong/ts-loader
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [{
            test: /\.ts$/,
            exclude: /node_modules/,
            use: [{
                loader: 'ts-loader',
            }]
        }]
    },
}
module.exports = config;