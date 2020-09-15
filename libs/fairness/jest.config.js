// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  name: "fairness",
  preset: "../../jest.config.js",
  transform: {
    "^.+\\.[tj]sx?$": [
      "babel-jest",
      { cwd: __dirname, configFile: "./babel-jest.config.json" }
    ]
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "html"],
  coverageDirectory: "../../coverage/libs/fairness"
};
