// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IBounds,
  IMetricRequest,
  IMetricResponse
} from "@responsible-ai/core-ui";

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
  return fetch("http://localhost:5000/1/metrics", {
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

export function generateRandomMetrics(
  request: IMetricRequest,
  abortSignal?: AbortSignal
): Promise<IMetricResponse> {
  const binSize = Math.max(...request.binVector);
  const bins: number[] = new Array(binSize + 1)
    .fill(0)
    .map(() => Math.random() / 3 + 0.33);
  const binBounds: IBounds[] = bins.map((bin) => {
    return {
      lower: bin - Math.pow(Math.random() / 3, 2),
      upper: bin + Math.pow(Math.random() / 3, 2)
    };
  });
  const global: number = Math.random() / 3 + 0.33;
  const bounds: IBounds = {
    lower: global - Math.pow(Math.random() / 3, 2),
    upper: global + Math.pow(Math.random() / 3, 2)
  };

  const promise = new Promise<IMetricResponse>((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve({
        binBounds,
        bins,
        bounds,
        global
      });
    }, 300);
    if (abortSignal) {
      abortSignal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }
  });
  return promise;
}
