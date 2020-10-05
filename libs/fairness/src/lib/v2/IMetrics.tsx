// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IMetricResponse } from "../IFairnessProps";

export interface IMetrics {
  performance: IMetricResponse;
  performanceDisparity: number;
  outcomes: IMetricResponse;
  outcomeDisparity: number;
  // Optional, based on model type
  falsePositiveRates?: IMetricResponse;
  falseNegativeRates?: IMetricResponse;
  overpredictions?: IMetricResponse;
  underpredictions?: IMetricResponse;
  // different length, raw unbinned errors and predictions
  errors?: number[];
  predictions?: number[];
}
