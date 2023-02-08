// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
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
  highChartConfigOverride?: IHighchartsConfig;
  isBubbleChartRendered?: boolean;
  xSeries: number[];
  ySeries: number[];
  indexSeries: number[];
  xMap?: { [key: number]: string };
  yMap?: { [key: number]: string };
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
  isRevertButtonClicked: boolean;
  selectedPointsIndexes: number[];
  localExplanationsData?: ILocalExplanations;
  isLocalExplanationsDataLoading?: boolean;
  localExplanationsErrorMessage?: string;
}

export function getInitialSpec(): ILargeIndividualFeatureImportanceViewState {
  return {
    bubbleChartErrorMessage: undefined,
    indexSeries: [],
    isBubbleChartDataLoading: false,
    isBubbleChartRendered: true,
    isLocalExplanationsDataLoading: false,
    isRevertButtonClicked: false,
    localExplanationsData: undefined,
    localExplanationsErrorMessage: undefined,
    selectedPointsIndexes: [],
    xSeries: [],
    ySeries: []
  };
}
