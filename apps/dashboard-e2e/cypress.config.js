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

function setupNodeEvents(on, config) {
  registerCypressPreprocessor(on, tsConfig);
  return e2ePreset.setupNodeEvents(on, config);
}

module.exports = defineConfig({
  chromeWebSecurity: false,
  downloadsFolder: "../../dist/cypress/apps/dashboard-e2e/downloads",
  execTimeout: 300000,
  experimentalSourceRewriting: true,
  modifyObstructiveCode: false,
  numTestsKeptInMemory: 30,
  pageLoadTimeout: 100000,
  requestTimeout: 30000,
  responseTimeout: 50000,
  screenshotOnRunFailure: true,
  screenshotsFolder: "../../dist/cypress/apps/dashboard-e2e/screenshots",
  video: true,
  videosFolder: "../../dist/cypress/apps/dashboard-e2e/videos",
  viewportHeight: 1080,
  viewportWidth: 1920,
  e2e: {
    ...e2ePreset,
    fixturesFolder: "src/fixtures",
    specPattern: "src/integration/**/*.spec.{js,jsx,ts,tsx}",
    supportFile: "src/support/index.ts",
    setupNodeEvents,
    testIsolation: false
  }
});
