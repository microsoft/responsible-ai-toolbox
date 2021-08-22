// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBounds, IMetricResponse } from "@responsible-ai/core-ui";
import { Dictionary } from "lodash";

export interface IMetrics {
  performance: IMetricResponse;
  outcomes: IMetricResponse;
  disparities: Dictionary<number>;
  disparityBounds?: Dictionary<IBounds>;
  // Optional, based on model type
  falsePositiveRates?: IMetricResponse;
  falseNegativeRates?: IMetricResponse;
  overpredictions?: IMetricResponse;
  underpredictions?: IMetricResponse;
  // different length, raw unbinned errors and predictions
  errors?: number[];
  predictions?: number[];
}
