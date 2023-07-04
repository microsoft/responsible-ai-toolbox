// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  getInitialClusterState,
  IClusterData,
  IGenericChartProps,
  IHighchartsConfig,
  ILocalExplanations,
  ITelemetryEvent,
  ModelTypes,
  WeightVectorOption
} from "@responsible-ai/core-ui";
import { Dictionary } from "lodash";

export interface ILargeIndividualFeatureImportanceViewProps {
  cohort: Cohort;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: Dictionary<string>;
  modelType: ModelTypes;
  telemetryHook?: (message: ITelemetryEvent) => void;
  onWeightChange: (option: WeightVectorOption) => void;
}

export interface ILargeIndividualFeatureImportanceViewState {
  chartProps?: IGenericChartProps;
  clusterData: IClusterData;
  highChartConfigOverride?: IHighchartsConfig;
  isBubbleChartRendered?: boolean;
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
  isRevertButtonClicked: boolean;
  selectedPointsIndexes: number[];
  localExplanationsData?: ILocalExplanations;
  isLocalExplanationsDataLoading?: boolean;
  localExplanationsErrorMessage?: string;
  bubblePlotData?: IHighchartsConfig;
}

export function getInitialSpec(): ILargeIndividualFeatureImportanceViewState {
  return {
    bubbleChartErrorMessage: undefined,
    bubblePlotData: undefined,
    clusterData: getInitialClusterState(),
    isBubbleChartDataLoading: false,
    isBubbleChartRendered: true,
    isLocalExplanationsDataLoading: false,
    isRevertButtonClicked: false,
    localExplanationsData: undefined,
    localExplanationsErrorMessage: undefined,
    selectedPointsIndexes: []
  };
}
