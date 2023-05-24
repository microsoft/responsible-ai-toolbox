const { getJestProjects } = require("@nrwl/jest");

module.exports = {
  projects: [
    ...getJestProjects(),
    "<rootDir>/libs/interpret",
    "<rootDir>/libs/fairness",
    "<rootDir>/libs/core-ui",
    "<rootDir>/libs/dataset-explorer",
    "<rootDir>/libs/causality",
    "<rootDir>/libs/counterfactuals",
    "<rootDir>/libs/mlchartlib",
    "<rootDir>/apps/dashboard",
    "<rootDir>/libs/localization",
    "<rootDir>/libs/error-analysis",
    "<rootDir>/libs/forecasting",
    "<rootDir>/apps/widget"
  ]
};
