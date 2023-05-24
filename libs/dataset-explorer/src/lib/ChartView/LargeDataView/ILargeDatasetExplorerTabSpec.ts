// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getInitialClusterState,
  IClusterData,
  IGenericChartProps,
  IHighchartsConfig,
  ITelemetryEvent
} from "@responsible-ai/core-ui";

export interface IDatasetExplorerTabProps {
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface IDatasetExplorerTabState {
  chartProps?: IGenericChartProps;
  clusterData: IClusterData;
  selectedCohortIndex: number;
  highChartConfigOverride?: any;
  isBubbleChartRendered?: boolean;
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
  isRevertButtonClicked?: boolean;
  bubblePlotData?: IHighchartsConfig;
  isAggregatePlotLoading?: boolean;
}

export function getInitialState(): IDatasetExplorerTabState {
  return {
    bubbleChartErrorMessage: undefined,
    clusterData: getInitialClusterState(),
    isBubbleChartDataLoading: false,
    isBubbleChartRendered: false,
    isRevertButtonClicked: false,
    selectedCohortIndex: 0
  };
}
