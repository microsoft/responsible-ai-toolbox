// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const supportedBinaryClassificationPerformanceKeys = [
  "accuracy_score",
  "balanced_accuracy_score",
  "precision_score",
  "recall_score",
  "f1_score"
];

export const supportedRegressionPerformanceKeys = [
  "mean_absolute_error",
  "r2_score",
  "mean_squared_error",
  "root_mean_squared_error"
];

export const supportedProbabilityPerformanceKeys = [
  "auc",
  "root_mean_squared_error",
  "balanced_root_mean_squared_error",
  "r2_score",
  "mean_squared_error",
  "mean_absolute_error"
];

export const messages = {
  LocalExpAndTestReq: [{ displayText: "LocalExpAndTestReq" }],
  LocalOrGlobalAndTestReq: [{ displayText: "LocalOrGlobalAndTestReq" }],
  PredictorReq: [{ displayText: "PredictorReq" }],
  TestReq: [{ displayText: "TestReq" }]
};

// calculateMetrics can be used with local flask server for debugging
/*export function calculateMetrics(postData: IMetricRequest): Promise<IMetricResponse> {
  return fetch("http://localhost:8704/1/metrics", {
    method: "post",
    body: JSON.stringify(postData),
    headers: {
    "Content-Type": "application/json"
    }
  })
  .then((resp) => {
    if (resp.status >= 200 && resp.status < 300) {
        return resp.json();
    }
    return Promise.reject(new Error(resp.statusText));
  })
  .then((json) => {
    if (json.error !== undefined) {
        throw new Error(json.error);
    }
    return Promise.resolve(json.data);
  });
}*/
