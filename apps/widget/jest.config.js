// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  coverageDirectory: "../../coverage/apps/widget",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  name: "widget",
  preset: "../../jest.config.js",
  transform: {
    "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "@nrwl/react/plugins/jest",
    "^.+\\.[tj]sx?$": [
      "babel-jest",
      { configFile: "./babel-jest.config.json", cwd: __dirname }
    ]
  }
};
