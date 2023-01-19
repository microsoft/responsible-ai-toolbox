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
}

export function getInitialState() {
  return {
    selectedCohortIndex: 0,
    isBubbleChartRendered: false,
    bubbleChartErrorMessage: undefined,
    indexSeries: [],
    xSeries: [],
    ySeries: [],
    isBubbleChartDataLoading: false,
    isRevertButtonClicked: false
  };
}
