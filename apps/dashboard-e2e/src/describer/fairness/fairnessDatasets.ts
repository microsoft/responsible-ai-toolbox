// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PredictionTypes } from "@responsible-ai/fairness";
import { IFairnessData } from "./IFairnessData";

const fairnessDatasets = {
  binaryClassification: {
    predictionType: PredictionTypes.BinaryClassification,
    sensitiveFeatures: {
      "Sensitive feature 0": ["a", "b", "very long group name indeed"],
      "Sensitive feature 1": ["1", "2", "3"],
      "Sensitive feature 2": [
        "test1",
        "test2",
        "test3",
        "test4",
        "test5",
        "test6",
        "test7",
        "test8"
      ],
      "Sensitive feature 3": ["0", "1", "2", "3"]
    },
    performanceMetrics: [
      "Accuracy",
      "Balanced accuracy",
      "Precision",
      "Recall",
      "F1-score"
    ],
    fairnessMetrics: [
      "Accuracy score difference",
      "Minimum accuracy score",
      "Accuracy score ratio",
      "Balanced accuracy score minimum",
      "Demographic parity difference",
      "Demographic parity ratio",
      "Equalized odds difference",
      "Equalized odds ratio",
      "Error rate difference",
      "Error rate ratio",
      "Minimum F1-score",
      "False negative rate difference",
      "False negative rate ratio",
      "False positive rate difference",
      "False positive rate ratio",
      "Minimum precision score",
      "Minimum recall score",
      "True negative rate difference",
      "True negative rate ratio",
      "True negative rate difference",
      "True positive rate ratio"
    ],
    numberOfModels: 3,
    charts: ["Selection rate", "False positive and false negative rates"]
  },
  probability: {
    predictionType: PredictionTypes.Probability,
    sensitiveFeatures: {
      "Sensitive feature 0": ["a", "b"],
      "Sensitive feature 1": ["1", "2", "3"]
    },
    performanceMetrics: [
      "Area under ROC curve",
      "Root mean squared error",
      "Balanced root mean squared error",
      "R-squared score",
      "Mean squared error",
      "Mean absolute error"
    ],
    fairnessMetrics: [
      "Maximum log loss",
      "Maximum mean squared error",
      "Minimum ROC AUC score"
    ],
    numberOfModels: 3,
    charts: ["Distribution of predictions", "Over- and underprediction"]
  },
  regression: {
    predictionType: PredictionTypes.Regression,
    sensitiveFeatures: {
      "Sensitive feature 0": ["a", "b"],
      "Sensitive feature 1": ["1", "2", "3"],
      "Sensitive feature 2": ["1 - 3", "4 - 5", "6 - 7", "8 - 9", "10 - 12"]
    },
    performanceMetrics: [
      "Mean absolute error",
      "R-squared score",
      "Mean squared error",
      "Root mean squared error"
    ],
    fairnessMetrics: [
      "Maximum mean absolute error",
      "Maximum mean squared error",
      "Minimum R2-score"
    ],
    numberOfModels: 3,
    charts: ["Distribution of predictions"]
  }
};
const withType: {
  [key in keyof typeof fairnessDatasets]: IFairnessData;
} = fairnessDatasets;

export { withType as fairnessDatasets };
