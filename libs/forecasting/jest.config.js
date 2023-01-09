// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  coverageDirectory: "../../coverage/libs/forecasting",
  displayName: "forecasting",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  preset: "../../jest.preset.js",
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest"
  }
};
