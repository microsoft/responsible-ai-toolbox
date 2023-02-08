// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IGenericChartProps, ITelemetryEvent } from "@responsible-ai/core-ui";

export interface IDatasetExplorerTabProps {
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface IDatasetExplorerTabState {
  chartProps?: IGenericChartProps;
  selectedCohortIndex: number;
  highChartConfigOverride?: any;
  isBubbleChartRendered?: boolean;
  xSeries: number[];
  ySeries: number[];
  indexSeries: number[];
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
  isRevertButtonClicked?: boolean;
  xMap?: { [key: number]: string };
  yMap?: { [key: number]: string };
}

export function getInitialState(): IDatasetExplorerTabState {
  return {
    bubbleChartErrorMessage: undefined,
    indexSeries: [],
    isBubbleChartDataLoading: false,
    isBubbleChartRendered: false,
    isRevertButtonClicked: false,
    selectedCohortIndex: 0,
    xSeries: [],
    ySeries: []
  };
}
