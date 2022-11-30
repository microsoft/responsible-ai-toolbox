// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const irisData = {
  aggregateFeatureImportanceExpectedValues: {
    "Average of absolute value": 0.329,
    "Class: setosa": 0.387,
    "Class: versicolor": 0.365,
    "Class: virginica": 0.236
  },
  datapoint: 30,
  datasetBarLabel: ["0 - 5", "6 - 11", "12 - 17", "18 - 23", "24 - 29"],
  defaultXAxis: "Index",
  defaultYAxis: "sepal length (cm)",
  featureNames: [
    "petal length (cm)",
    "petal width (cm)",
    "sepal length (cm)",
    "sepal width (cm)"
  ],
  isClassification: true,
  isMulticlass: true
};
export const irisDataNoLocal = {
  datapoint: 30,
  datasetBarLabel: ["0 - 5", "6 - 11", "12 - 17", "18 - 23", "24 - 29"],
  defaultXAxis: "Index",
  defaultYAxis: "sepal length (cm)",
  featureNames: [
    "petal length (cm)",
    "petal width (cm)",
    "sepal length (cm)",
    "sepal width (cm)"
  ],
  isClassification: true,
  isMulticlass: true,
  noLocalImportance: true
};
export const irisGlobal = {
  featureNames: [
    "petal length (cm)",
    "petal width (cm)",
    "sepal length (cm)",
    "sepal width (cm)"
  ],
  isClassification: true,
  isMulticlass: true,
  noDataset: true,
  noLocalImportance: true,
  noPredict: true,
  noY: true
};
export const irisNoData = {
  featureNames: [
    "petal length (cm)",
    "petal width (cm)",
    "sepal length (cm)",
    "sepal width (cm)"
  ],
  isClassification: true,
  isMulticlass: true,
  noDataset: true,
  noPredict: true,
  noY: true
};
export const irisNoFeatures = {
  datapoint: 30,
  datasetBarLabel: ["0 - 5", "6 - 11", "12 - 17", "18 - 23", "24 - 29"],
  defaultXAxis: "Index",
  defaultYAxis: "Feature 0",
  featureNames: ["Feature 2", "Feature 3", "Feature 0", "Feature 1"],
  isClassification: true,
  isMulticlass: true
};
