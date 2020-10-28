// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  coverageDirectory: "../../coverage/libs/error-analysis",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "html"],
  name: "error-analysis",
  preset: "../../jest.config.js",
  transform: {
    "^.+\\.[tj]sx?$": [
      "babel-jest",
      { configFile: "./babel-jest.config.json", cwd: __dirname }
    ]
  }
};
