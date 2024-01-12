// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  coverageDirectory: "../../coverage/libs/fairness",
  coverageThreshold: {
    "./libs/fairness/src/lib/util/calculateFairnessMetric.ts": {
      branches: 98,
      functions: 98,
      lines: 98,
      statements: 98
    }
  },
  displayName: "fairness",
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
