// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  convertBinaryClassificationMetrics,
  convertRegressionMetrics,
  convertMultiClassClassificationMetrics
} from "./Metrics";

const regressionMetrics = {
  "Mean absolute error": 43.36258426966292,
  "Mean prediction": 154.1016853932584,
  "Mean squared error": 2981.101198876404,
  "Median absolute error": 0.4012770817975404,
  "R2 score": 0.4012770817975404,
  "Sample size": 5
};

const binaryClassificationMetrics = {
  "Accuracy score": 0.7,
  "Error rate": Number.NaN,
  "F1 score": 0.823529411764706,
  "False negative rate": 0.2222222222222222,
  "False positive rate": 1,
  "Precision score": 0.7777777777777778,
  "Recall score": 0.875,
  "Sample size": 5,
  "Selection rate": 0.9
};

const multiclassClassificationMetrics = {
  "Accuracy score": 0.9666666666666667,
  "Error rate": Number.NaN,
  "Macro F1 score": 0.9610256410256409,
  "Macro precision score": 0.9523809523809524,
  "Macro recall score": 0.9743589743589745,
  "Micro F1 score": 0.9666666666666667,
  "Micro precision score": 0.9666666666666667,
  "Micro recall score": 0.9666666666666667,
  "Sample size": 5
};

describe("Test convertRegressionMetrics", () => {
  it("should return false", () => {
    const processedMetrics = convertRegressionMetrics(regressionMetrics);
    expect(processedMetrics).toBeDefined();
    expect(processedMetrics.length).toEqual(5);
  });
});

describe("Test convertBinaryClassificationMetrics", () => {
  it("should return false", () => {
    const processedMetrics = convertBinaryClassificationMetrics(
      binaryClassificationMetrics
    );
    expect(processedMetrics).toBeDefined();
    expect(processedMetrics.length).toEqual(8);
  });
});

describe("Test convertMultiClassClassificationMetrics", () => {
  it("should return false", () => {
    const processedMetrics = convertMultiClassClassificationMetrics(
      multiclassClassificationMetrics
    );
    expect(processedMetrics).toBeDefined();
    expect(processedMetrics.length).toEqual(2);
  });
});
