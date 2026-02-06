// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const { preprocessTypescript } = require("@nrwl/cypress/plugins/preprocessor");

// Custom webpack config to ignore CSS files that some dependencies require
// (CSS is not needed for e2e tests) and disable caching for Node 20 compatibility
const customizeWebpackConfig = (webpackConfig) => {
  webpackConfig.module.rules.push({
    loader: "null-loader",
    test: /\.css$/
  });
  // Disable webpack caching to ensure fresh transpilation
  webpackConfig.cache = false;
  return webpackConfig;
};

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // Preprocess Typescript file using Nx helper with custom webpack config
  on("file:preprocessor", preprocessTypescript(config, customizeWebpackConfig));
  on("task", {
    log(message) {
      console.log(message);
      return null;
    }
  });
};
