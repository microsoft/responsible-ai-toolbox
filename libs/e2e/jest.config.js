// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  coverageDirectory: "../../coverage/libs/e2e",
  displayName: "e2e",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  preset: "../../jest.preset.js",
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "/node_modules/(?!d3|d3-array|internmap|delaunator|robust-predicates)"
  ]
};
