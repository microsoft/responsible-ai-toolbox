// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const { preprocessTypescript } = require("@nrwl/cypress/plugins/preprocessor");
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // Preprocess Typescript file using Nx helper
  on("file:preprocessor", preprocessTypescript(config));
};
