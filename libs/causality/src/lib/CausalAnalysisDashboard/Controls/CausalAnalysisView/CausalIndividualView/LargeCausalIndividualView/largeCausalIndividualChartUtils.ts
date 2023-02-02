// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  calculateBubblePlotDataFromErrorCohort,
  Cohort,
  IDataset,
  IGenericChartProps,
  IHighchartBubbleSDKClusterData,
  IHighchartsConfig,
  IScatterPoint,
  ITelemetryEvent,
  JointDataset,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";

export async function getBubblePlotData(
  chartProps: IGenericChartProps,
  cohort: Cohort,
  jointDataset: JointDataset,
  dataset: IDataset,
  isLocalExplanationsDataLoading?: boolean,
  requestBubblePlotData?:
    | ((
        filter: unknown[],
        compositeFilter: unknown[],
        xAxis: string,
        yAxis: string,
        abortSignal: AbortSignal
      ) => Promise<IHighchartBubbleSDKClusterData>)
    | undefined,
  selectPointFromChartLargeData?: (data: IScatterPoint) => Promise<void>,
  onBubbleClick?: (
    scatterPlotData: IHighchartsConfig,
    xSeries: number[],
    ySeries: number[],
    indexSeries: number[]
  ) => void
): Promise<IHighchartBubbleSDKClusterData | IHighchartsConfig | undefined> {
  return await calculateBubblePlotDataFromErrorCohort(
    cohort,
    chartProps,
    [],
    jointDataset,
    dataset,
    isLocalExplanationsDataLoading,
    true,
    false,
    requestBubblePlotData,
    selectPointFromChartLargeData,
    onBubbleClick,
    undefined
  );
}

export async function selectPointFromChartLargeData(
  data: IScatterPoint,
  setLocalCausalData: (absoluteIndex: number) => Promise<void>,
  toggleSelectionOfPoint: (index?: number) => void,
  telemetryHook?: ((message: ITelemetryEvent) => void) | undefined
): Promise<void> {
  const index = data.customData[JointDataset.IndexLabel];
  const absoluteIndex = data.customData[JointDataset.AbsoluteIndexLabel];
  if (absoluteIndex) {
    setLocalCausalData(absoluteIndex);
  }
  toggleSelectionOfPoint(index);
  telemetryHook?.({
    level: TelemetryLevels.ButtonClick,
    type: TelemetryEventName.IndividualCausalSelectedDatapointUpdatedFromChart
  });
}
