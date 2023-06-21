// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Cohort } from "../../Cohort/Cohort";
import { IDataset } from "../../Interfaces/IDataset";
import { IHighchartBubbleSDKClusterData } from "../../Interfaces/IHighchartBubbleData";
import { ifEnableLargeData } from "../../util/buildInitialContext";
import { IGenericChartProps } from "../../util/IGenericChartProps";
import { ITelemetryEvent, TelemetryLevels } from "../../util/ITelemetryEvent";
import { JointDataset } from "../../util/JointDataset";
import { TelemetryEventName } from "../../util/TelemetryEventName";
import { IHighchartsConfig } from "../IHighchartsConfig";

import { IClusterData } from "./ChartUtils";
import { getBubbleChartOptions } from "./getBubbleChartOptions";
import { IScatterPoint } from "./getScatterOption";

export async function calculateBubblePlotDataFromErrorCohort(
  errorCohort: Cohort,
  chartProps: IGenericChartProps,
  customPoints: Array<{
    [key: string]: any;
  }>,
  jointDataset: JointDataset,
  dataset: IDataset,
  isScatterPlotDataLoading?: boolean,
  showColorAxis?: boolean,
  useDifferentColorForScatterPoints?: boolean,
  eventName?: TelemetryEventName,
  requestBubblePlotData?: (
    filter: unknown[],
    compositeFilter: unknown[],
    xAxis: string,
    yAxis: string,
    abortSignal: AbortSignal
  ) => Promise<IHighchartBubbleSDKClusterData>,
  selectPointFromChartLargeData?: (data: IScatterPoint) => void,
  onBubbleClick?: (
    scatterPlotData: IHighchartsConfig,
    clusterData: IClusterData
  ) => void,
  onIndexSeriesUpdated?: (indexSeries: number[]) => void,
  telemetryHook?: (message: ITelemetryEvent) => void
): Promise<IHighchartsConfig | IHighchartBubbleSDKClusterData | undefined> {
  if (ifEnableLargeData(dataset) && requestBubblePlotData) {
    try {
      const selectedPointsIndexes: number[] = [];
      const bubbleChartData = await calculateBubblePlotDataFromSDK(
        errorCohort,
        jointDataset,
        requestBubblePlotData,
        jointDataset.metaDict[chartProps?.xAxis.property].label,
        jointDataset.metaDict[chartProps?.yAxis.property].label
      );
      telemetryHook?.({
        level: TelemetryLevels.Trace,
        message: eventName,
        type: TelemetryEventName.BubblePlotDataFetchSuccess
      });
      return getBubbleChartOptions(
        bubbleChartData.clusters,
        jointDataset.metaDict[chartProps?.xAxis.property].label,
        jointDataset.metaDict[chartProps?.yAxis.property].label,
        chartProps,
        jointDataset,
        selectedPointsIndexes,
        customPoints,
        isScatterPlotDataLoading,
        showColorAxis,
        useDifferentColorForScatterPoints,
        onBubbleClick,
        selectPointFromChartLargeData,
        onIndexSeriesUpdated
      );
    } catch (error) {
      if (error) {
        telemetryHook?.({
          context: error,
          level: TelemetryLevels.Error,
          message: eventName,
          type: TelemetryEventName.BubblePlotDataFetchError
        });
        return error;
      }
    }
  }
  return undefined;
}

export async function calculateBubblePlotDataFromSDK(
  errorCohort: Cohort,
  jointDataset: JointDataset,
  requestBubblePlotData: (
    filter: unknown[],
    compositeFilter: unknown[],
    xAxis: string,
    yAxis: string,
    abortSignal: AbortSignal
  ) => Promise<IHighchartBubbleSDKClusterData>,
  xAxis: string,
  yAxis: string
): Promise<IHighchartBubbleSDKClusterData> {
  const filtersRelabeled = Cohort.getLabeledFilters(
    errorCohort.filters,
    jointDataset
  );
  const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
    errorCohort.compositeFilters,
    jointDataset
  );
  const result: IHighchartBubbleSDKClusterData = await requestBubblePlotData?.(
    filtersRelabeled,
    compositeFiltersRelabeled,
    xAxis,
    yAxis,
    new AbortController().signal
  );

  return result;
}

export function instanceOfHighChart(object: any): object is IHighchartsConfig {
  return "chart" in object;
}
