// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationDashboardData } from "@responsible-ai/interpret";

export const irisGlobal: IExplanationDashboardData = {
  modelInformation: { modelClass: "blackbox", method: "classifier" },
  dataSummary: {
    classNames: ["setosa", "versicolor", "virginica"],
    featureNames: [
      "sepal length (cm)",
      "sepal width (cm)",
      "petal length (cm)",
      "petal width (cm)"
    ]
  },
  precomputedExplanations: {
    globalFeatureImportance: {
      intercept: 1,
      scores: [
        0.017800017217248786,
        0.011517443776666336,
        0.32944454026478104,
        0.08439875569117994
      ]
    }
  }
};
