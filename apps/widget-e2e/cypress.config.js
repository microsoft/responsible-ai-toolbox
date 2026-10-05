// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { defineConfig } = require("cypress");
const { nxE2EPreset } = require("@nx/cypress/plugins/cypress-preset");
const path = require("path");
const { registerCypressPreprocessor } = require("../../cypress.preprocessor");

const e2ePreset = nxE2EPreset(__filename, {
  cypressDir: "src"
});
const tsConfig = path.join(__dirname, "tsconfig.e2e.json");

module.exports = defineConfig({
  chromeWebSecurity: false,
  downloadsFolder: "../../dist/cypress/apps/widget-e2e/downloads",
  experimentalSourceRewriting: true,
  modifyObstructiveCode: false,
  pageLoadTimeout: 300000,
  requestTimeout: 60000,
  responseTimeout: 300000,
  screenshotOnRunFailure: true,
  screenshotsFolder: "../../dist/cypress/apps/widget-e2e/screenshots",
  video: true,
  videosFolder: "../../dist/cypress/apps/widget-e2e/videos",
  viewportHeight: 1080,
  viewportWidth: 1920,
  e2e: {
    ...e2ePreset,
    fixturesFolder: "src/fixtures",
    async setupNodeEvents(on, config) {
      registerCypressPreprocessor(on, tsConfig);
      await e2ePreset.setupNodeEvents(on, config);
      on("task", {
        log(message) {
          console.log(message);
          return null;
        }
      });
      return config;
    },
    specPattern: "src/integration/**/*.spec.{js,jsx,ts,tsx}",
    supportFile: "src/support/index.ts",
    testIsolation: false
  }
});
