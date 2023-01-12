// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  IDataset,
  ifEnableLargeData,
  IGenericChartProps,
  IHighchartBubbleSDKClusterData,
  IHighchartsConfig,
  JointDataset
} from "@responsible-ai/core-ui";

import { getBubbleChartOptions } from "./getBubbleChartOptions";
import { IScatterPoint } from "./getCounterfactualsScatterOption";

export async function calculateBubblePlotDataFromErrorCohort(
  errorCohort: Cohort,
  chartProps: IGenericChartProps,
  selectedPointsIndexes: number[],
  customPoints: Array<{
    [key: string]: any;
  }>,
  jointDataset: JointDataset,
  dataset: IDataset,
  isCounterfactualsDataLoading?: boolean,
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
    xSeries: number[],
    ySeries: number[],
    indexSeries: number[]
  ) => void,
  onIndexSeriesUpdated?: (indexSeries: number[]) => void
): Promise<IHighchartsConfig | IHighchartBubbleSDKClusterData | undefined> {
  if (ifEnableLargeData(dataset) && requestBubblePlotData) {
    try {
      const bubbleChartData = await calculateBubblePlotDataFromSDK(
        errorCohort,
        jointDataset,
        requestBubblePlotData,
        jointDataset.metaDict[chartProps?.xAxis.property].label,
        jointDataset.metaDict[chartProps?.yAxis.property].label
      );
      return getBubbleChartOptions(
        bubbleChartData.clusters,
        jointDataset.metaDict[chartProps?.xAxis.property].label,
        jointDataset.metaDict[chartProps?.yAxis.property].label,
        chartProps,
        jointDataset,
        selectedPointsIndexes,
        customPoints,
        isCounterfactualsDataLoading,
        onBubbleClick,
        selectPointFromChartLargeData,
        onIndexSeriesUpdated
      );
    } catch (error) {
      if (error) {
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
