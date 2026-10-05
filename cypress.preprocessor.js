// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const webpackPreprocessor = require("@cypress/webpack-preprocessor");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const webpack = require("webpack");

function registerCypressPreprocessor(on, tsConfig) {
  on(
    "file:preprocessor",
    webpackPreprocessor({
      webpackOptions: {
        mode: "development",
        module: {
          rules: [
            {
              test: /\.[jt]sx?$/,
              exclude: /node_modules/,
              use: {
                loader: "ts-loader",
                options: {
                  configFile: tsConfig,
                  transpileOnly: true
                }
              }
            },
            {
              test: /\.css$/,
              use: "null-loader"
            }
          ]
        },
        plugins: [
          new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
            process: "process/browser"
          })
        ],
        resolve: {
          extensions: [".ts", ".tsx", ".js", ".jsx"],
          fallback: {
            assert: require.resolve("assert/"),
            child_process: false,
            dgram: false,
            dns: false,
            fs: false,
            http2: false,
            module: false,
            net: false,
            stream: require.resolve("stream-browserify"),
            tls: false,
            url: require.resolve("url/")
          },
          plugins: [
            new TsconfigPathsPlugin({
              configFile: tsConfig
            })
          ]
        }
      }
    })
  );
}

module.exports = { registerCypressPreprocessor };
