// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  externals: {
    'applicationinsights-native-metrics': 'commonjs applicationinsights-native-metrics',
    vscode: 'commonjs vscode',
  },
  devtool: 'source-map',
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
    }, {
      test: /\.node$/,
      loader: 'native-ext-loader',
    }]
  },
}
module.exports = config;
