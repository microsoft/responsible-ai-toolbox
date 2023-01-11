// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  IDataset,
  ifEnableLargeData,
  IGenericChartProps,
  IHighchartsConfig,
  JointDataset
} from "@responsible-ai/core-ui";

import { getBubbleChartOptions } from "./getBubbleChartOptions";

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
  requestBubblePlotDistribution?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>,
  selectPointFromChartLargeData?: (data: any) => void,
  onBubbleClick?: (
    scatterPlotData: any,
    xSeries: number[],
    ySeries: number[],
    indexSeries: number[]
  ) => void,
  onIndexSeriesUpdated?: (indexSeries?: number[]) => void
): Promise<any | undefined> {
  if (ifEnableLargeData(dataset) && requestBubblePlotDistribution) {
    try {
      const bubbleChartData = await calculateBubblePlotDataFromSDK(
        errorCohort,
        jointDataset,
        requestBubblePlotDistribution,
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
}

export async function calculateBubblePlotDataFromSDK(
  errorCohort: Cohort,
  jointDataset: JointDataset,
  requestBubblePlotData: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>,
  xAxis?: string,
  yAxis?: string
): Promise<any> {
  const filtersRelabeled = Cohort.getLabeledFilters(
    errorCohort.filters,
    jointDataset
  );
  const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
    errorCohort.compositeFilters,
    jointDataset
  );
  const data = [filtersRelabeled, compositeFiltersRelabeled, xAxis, yAxis];
  const result: any = await requestBubblePlotData?.(
    data,
    new AbortController().signal
  );

  return result;
}

export function instanceOfHighChart(object: any): object is IHighchartsConfig {
  return "chart" in object;
}
