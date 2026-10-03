// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { nxE2EPreset } = require("@nx/cypress/plugins/cypress-preset");
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: "src"
    }),
    downloadsFolder: "../../dist/cypress/libs/e2e/downloads",
    fixturesFolder: false,
    screenshotsFolder: "../../dist/cypress/libs/e2e/screenshots",
    specPattern: "src/integration/**/*.spec.{js,jsx,ts,tsx}",
    supportFile: false,
    testIsolation: false,
    videosFolder: "../../dist/cypress/libs/e2e/videos"
  },
  experimentalSourceRewriting: true,
  modifyObstructiveCode: false,
  screenshotOnRunFailure: true,
  video: true,
  viewportHeight: 1080,
  viewportWidth: 1920
});
