// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";
import { getBubbleChartOptions } from "../lib/getBubbleChartOptions";
import { generatePlotlyProps } from "./generatePlotlyProps";
import { getCounterfactualChartOptions } from "./getCounterfactualChartOptions";
//import { responseTemp } from "./responseTemp";

export async function calculateBubblePlotDataFromErrorCohort(
  errorCohort: Cohort,
  chartProps: IGenericChartProps,
  selectedPointsIndexes: number[],
  customPoints: Array<{
    [key: string]: any;
  }>,
  jointDataset: JointDataset,
  isCounterfactualsDataLoading?: boolean,
  requestBubblePlotDistribution?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>,
  selectPointFromChart?: (data: any) => void,
  selectPointFromChartLargeData?: (data: any) => void,
  onBubbleClick?: (
    scatterPlotData: any,
    x_series: number[],
    y_series: number[],
    index_series: number[]
  ) => void,
  onIndexSeriesUpdated?: (indexSeries?: number[]) => void
): Promise<any | undefined> {
  console.log(
    "!!calculateBubblePlotDataFromErrorCohort requestBubblePlotDistribution",
    requestBubblePlotDistribution,
    errorCohort,
    selectPointFromChartLargeData
  );
  if (requestBubblePlotDistribution) {
    const bubbleChartData = await calculateBubblePlotDataFromSDK(
      errorCohort,
      jointDataset,
      requestBubblePlotDistribution,
      jointDataset.metaDict[chartProps?.xAxis.property].label,
      jointDataset.metaDict[chartProps?.yAxis.property].label
    );
    return getBubbleChartOptions(
      bubbleChartData["clusters"], //responseTemp
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
  }
  // If compute instance is not connected, calculate based on the first 5k data
  return calculateOriginalScatterPlotData(
    chartProps,
    selectedPointsIndexes,
    customPoints,
    jointDataset,
    errorCohort,
    selectPointFromChart
  );
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
  console.log("!!calculateBubblePlotDataFromSDK");
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

  console.log("!!calculateBubblePlotDataFromSDK result: ", result);

  return result;
}

export function calculateOriginalScatterPlotData(
  chartProps: IGenericChartProps,
  selectedPointsIndexes: number[],
  customPoints: Array<{
    [key: string]: any;
  }>,
  jointDataset: JointDataset,
  cohort: Cohort,
  selectPointFromChart?: (data: any) => void
): any | undefined {
  console.log("!!calculateBubblePlotData: ", cohort);
  const plotlyProps = generatePlotlyProps(
    jointDataset,
    chartProps,
    cohort,
    selectedPointsIndexes,
    customPoints
  );
  const chartOptions = getCounterfactualChartOptions(
    plotlyProps,
    selectPointFromChart,
    chartProps
  );
  console.log("!!calculateBubblePlotData plotlyProps: ", plotlyProps);

  return chartOptions;
}
