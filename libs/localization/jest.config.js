// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  coverageDirectory: "../../coverage/libs/localization",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  name: "localization",
  preset: "../../jest.config.js",
  transform: {
    "^.+\\.[tj]sx?$": [
      "babel-jest",
      { configFile: "./babel-jest.config.json", cwd: __dirname }
    ]
  }
};
