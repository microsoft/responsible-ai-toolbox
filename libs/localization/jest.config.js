// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  coverageDirectory: "../../coverage/libs/localization",
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.spec.json"
    }
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  name: "localization",
  preset: "../../jest.config.js",
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest"
  }
};
