'use strict';

var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var StringReplacePlugin = require('string-replace-webpack-plugin');
var Config = require('./hosting-config');

var lookup = {
  '<VERSION>': Config.version,
  '<CDN_HTTP>': Config.cdn_http,
  '<CDN_HTTPS>': Config.cdn_https,
  '<DEPENDENCY_SUFFIX>': Config.dependency_suffix,
};

var replacements = [];

for (let i of Object.keys(lookup)) {
  replacements.push({
    pattern: i,
    replacement: function() {
      return lookup[i];
    },
  });
}

/*
  Upon importing the 'runtime' module, this nativescript build is made to look at
  src/runtimes/nativescript/runtime.ts by the below webpack resolution config.
  This is achieved by adding 'src/runtimes/nativescript' to the resolve.modulesDirectories array

  -- CONVENIENCE --
  We also add 'src/runtimes' to the list for convenient referencing of 'isomorphic/' implementations.
  We also add 'src/' so that the runtimes/nativescript folder can conveniently import 'core/' modules.
*/
module.exports = {
  entry: {
    pusher: './node_modules/pusher-js/src/core/index',
  },
  output: {
    library: 'Pusher',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist'),
    filename: 'pusher-nativescript.js',
  },
  target: 'node',
  externals: {
    'tns-core-modules/xhr': 'tns-core-modules/xhr', // our Reachability implementation needs to reference nativescript core modules.
    'tns-core-modules/connectivity': 'tns-core-modules/connectivity', // our Reachability implementation needs to reference nativescript core modules.
    'nativescript-websockets': 'nativescript-websockets', // our Reachability implementation needs a websockets implementation.
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js'],
    modulesDirectories: [
      'node_modules/pusher-js/src/',
      'src/runtimes/nativescript',
      'node_modules/pusher-js/src/runtimes',
      'node_modules',
    ],
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' },
      {
        test: /.*/,
        loader: StringReplacePlugin.replace({ replacements: replacements }),
      },
      { test: /\.js$/, loader: 'es3ify-loader' },
    ],
  },
  plugins: [
    new webpack.BannerPlugin(
      fs
        .readFileSync('./node_modules/pusher-js/src/core/pusher-licence.js', 'utf8')
        .replace('<VERSION>', Config.version),
      { raw: true }
    ),
    new StringReplacePlugin(),
  ],
};
