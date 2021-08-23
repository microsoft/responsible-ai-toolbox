// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFairnessData,
  IMetricRequest,
  IMetricResponse
} from "@responsible-ai/core-ui";

export type IFairnessProps = IFairnessData & {
  startingTabIndex?: number;
  theme?: any;
  locale?: string;
  stringParams?: any;
  supportedBinaryClassificationPerformanceKeys: string[];
  supportedRegressionPerformanceKeys: string[];
  supportedProbabilityPerformanceKeys: string[];
  errorBarsEnabled?: boolean;
  iconUrl?: string;
  // The request hook
  requestMetrics?: (
    request: IMetricRequest,
    abortSignal?: AbortSignal
  ) => Promise<IMetricResponse>;
};
