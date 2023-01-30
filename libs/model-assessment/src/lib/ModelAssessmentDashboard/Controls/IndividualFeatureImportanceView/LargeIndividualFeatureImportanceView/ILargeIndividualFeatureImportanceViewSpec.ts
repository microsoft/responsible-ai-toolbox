import {
  Cohort,
  IGenericChartProps,
  ITelemetryEvent,
  ModelTypes,
  WeightVectorOption
} from "@responsible-ai/core-ui";

export interface ILargeIndividualFeatureImportanceViewProps {
  cohort: Cohort;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  modelType: ModelTypes;
  telemetryHook?: (message: ITelemetryEvent) => void;
  onWeightChange: (option: WeightVectorOption) => void;
}

export interface ILargeIndividualFeatureImportanceViewState {
  chartProps?: IGenericChartProps;
  highChartConfigOverride?: any;
  isBubbleChartRendered?: boolean;
  xSeries: number[];
  ySeries: number[];
  indexSeries: number[];
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
  isRevertButtonClicked: boolean;
  selectedPointsIndexes: number[];
  localExplanationsData: any;
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
