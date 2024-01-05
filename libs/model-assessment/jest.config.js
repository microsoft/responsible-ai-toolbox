// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  coverageDirectory: "../../coverage/libs/model-assessment",
  coverageThreshold: {
    "libs/model-assessment/src/lib/ModelAssessmentDashboard/Cohort/ProcessPreBuiltCohort.ts":
      {
        branches: 69,
        functions: 100,
        lines: 90,
        statements: 90
      },
    "libs/model-assessment/src/lib/ModelAssessmentDashboard/Controls/DashboardSettingDeleteButton.tsx":
      {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100
      }
  },
  displayName: "model-assessment",
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
