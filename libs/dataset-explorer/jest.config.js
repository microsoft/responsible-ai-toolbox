// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  coverageDirectory: "../../coverage/libs/dataset-explorer",
  displayName: "dataset-explorer",

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "html"],
  preset: "../../jest.preset.js",
  transform: {
    "^.+\\.[tj]sx?$": [
      "babel-jest",
      { configFile: "./babel-jest.config.json", cwd: __dirname }
    ]
  },
  transformIgnorePatterns: [
    "/node_modules/(?!d3|d3-array|internmap|delaunator|robust-predicates)"
  ]
};
