// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  ICausalAnalysisData,
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
  selectedPointsIndexes: number[];
  plotData?: IHighchartsConfig;
  temporaryPoint?: { [key: string]: any };
  xSeries: number[];
  ySeries: number[];
  indexSeries: number[];
  isRevertButtonClicked: boolean;
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
  isBubbleChartRendered: boolean;
  isLocalCausalDataLoading: boolean;
  localCausalErrorMessage?: string;
  localCausalData?: ICausalAnalysisData;
  xMap?: { [key: number]: string };
  yMap?: { [key: number]: string };
}

export function getInitialSpec(): ILargeCausalIndividualChartState {
  return {
    bubbleChartErrorMessage: undefined,
    indexSeries: [],
    isBubbleChartDataLoading: false,
    isBubbleChartRendered: true,
    isLocalCausalDataLoading: false,
    isRevertButtonClicked: false,
    localCausalData: undefined,
    plotData: undefined,
    selectedPointsIndexes: [],
    xSeries: [],
    ySeries: []
  };
}
