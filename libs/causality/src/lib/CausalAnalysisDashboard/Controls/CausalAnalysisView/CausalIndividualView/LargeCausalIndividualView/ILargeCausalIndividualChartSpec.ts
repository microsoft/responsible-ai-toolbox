// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  getInitialClusterState,
  ICausalAnalysisData,
  IClusterData,
  IGenericChartProps,
  IHighchartsConfig,
  ITelemetryEvent
} from "@responsible-ai/core-ui";

export interface ILargeCausalIndividualChartProps {
  causalId: string;
  cohort: Cohort;
  onDataClick: (
    isLocalCausalDataLoading: boolean,
    data?: ICausalAnalysisData
  ) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface ILargeCausalIndividualChartState {
  chartProps?: IGenericChartProps;
  clusterData: IClusterData;
  selectedPointsIndexes: number[];
  plotData?: IHighchartsConfig;
  temporaryPoint?: { [key: string]: any };
  isRevertButtonClicked: boolean;
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
  isBubbleChartRendered: boolean;
  isLocalCausalDataLoading: boolean;
  localCausalErrorMessage?: string;
  localCausalData?: ICausalAnalysisData;
  bubblePlotData?: IHighchartsConfig;
}

export function getInitialSpec(): ILargeCausalIndividualChartState {
  return {
    bubbleChartErrorMessage: undefined,
    clusterData: getInitialClusterState(),
    isBubbleChartDataLoading: false,
    isBubbleChartRendered: true,
    isLocalCausalDataLoading: false,
    isRevertButtonClicked: false,
    localCausalData: undefined,
    plotData: undefined,
    selectedPointsIndexes: []
  };
}
