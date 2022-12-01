// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Cohort } from "../../../core-ui/src/lib/Cohort/Cohort";
import { IModelAssessmentContext } from "../../../core-ui/src/lib/Context/ModelAssessmentContext";
import { IGenericChartProps } from "../../../core-ui/src/lib/util/IGenericChartProps";
import { generatePlotlyProps } from "./generatePlotlyProps";

export async function calculateBubblePlotDataFromErrorCohort(
  errorCohort: Cohort,
  chartProps: IGenericChartProps,
  selectedPointsIndexes: number[],
  customPoints: Array<{
    [key: string]: any;
  }>,
  context: IModelAssessmentContext,
  xAxis?: string,
  yAxis?: string,
  requestBubblePlotDistribution?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>
): Promise<any | undefined> {
  if (requestBubblePlotDistribution) {
    return await calculateBubblePlotDataFromSDK(
      errorCohort,
      context,
      requestBubblePlotDistribution,
      xAxis,
      yAxis
    );
  }
  // key is the identifier for the column (e.g., probability)
  // If compute instance is not connected, calculate based on the first 5k data
  return calculateBubblePlotData(
    chartProps,
    selectedPointsIndexes,
    customPoints,
    context
  );
}

export async function calculateBubblePlotDataFromSDK(
  errorCohort: Cohort,
  context: IModelAssessmentContext,
  requestBubblePlotData: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>,
  xAxis?: string,
  yAxis?: string
): Promise<any> {
  const filtersRelabeled = Cohort.getLabeledFilters(
    errorCohort.filters,
    context.jointDataset
  );

  const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
    errorCohort.compositeFilters,
    context.jointDataset
  );
  const data = [filtersRelabeled, compositeFiltersRelabeled, xAxis, yAxis];

  const result: any = await requestBubblePlotData?.(
    data,
    new AbortController().signal
  );

  console.log("!!result: ", result);

  return result;
}

export function calculateBubblePlotData(
  chartProps: IGenericChartProps,
  selectedPointsIndexes: number[],
  customPoints: Array<{
    [key: string]: any;
  }>,
  context: IModelAssessmentContext
): any | undefined {
  const plotlyProps = generatePlotlyProps(
    context.jointDataset,
    chartProps,
    context.selectedErrorCohort.cohort,
    selectedPointsIndexes,
    customPoints
  );
  return plotlyProps;
}

export function getPercentile(
  sortedData: number[],
  percentile: number
): number | undefined {
  if (percentile <= 0 || percentile >= 100 || sortedData.length === 0) {
    return undefined;
  }
  const index = (percentile / 100) * sortedData.length;
  let result;
  if (Math.floor(index) === index) {
    // take average of the two adjacent numbers
    result = (sortedData[index - 1] + sortedData[index]) / 2;
  } else {
    result = sortedData[Math.floor(index)];
  }
  return result;
}
