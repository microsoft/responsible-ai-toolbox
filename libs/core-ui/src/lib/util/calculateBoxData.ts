// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";

import { Cohort } from "../Cohort/Cohort";
import { ErrorCohort } from "../Cohort/ErrorCohort";
import { IBoxChartState } from "../Highchart/IBoxChartState";
import { IHighchartBoxData } from "../Interfaces/IHighchartBoxData";

export async function calculateBoxPlotDataFromErrorCohort(
  errorCohort: ErrorCohort,
  index: number,
  key: string,
  queryClass?: string,
  requestBoxPlotDistribution?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<IHighchartBoxData>,
  ifEnableLargeData?: boolean
): Promise<IHighchartBoxData | undefined> {
  if (ifEnableLargeData && requestBoxPlotDistribution) {
    return await calculateBoxPlotDataFromSDK(
      errorCohort,
      requestBoxPlotDistribution,
      queryClass
    );
  }
  // key is the identifier for the column (e.g., probability)
  // If compute instance is not connected, calculate based on the first 5k data
  return calculateBoxPlotData(
    errorCohort.cohort.filteredData.map((dict) => dict[key]),
    index
  );
}

export async function calculateBoxPlotDataFromSDK(
  errorCohort: ErrorCohort,
  requestBoxPlotDistribution: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<IHighchartBoxData>,
  queryClass?: string
): Promise<IHighchartBoxData> {
  const filtersRelabeled = Cohort.getLabeledFilters(
    errorCohort.cohort.filters,
    errorCohort.jointDataset
  );

  const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
    errorCohort.cohort.compositeFilters,
    errorCohort.jointDataset
  );
  const data = [filtersRelabeled, compositeFiltersRelabeled, queryClass];

  const result: IHighchartBoxData = await requestBoxPlotDistribution?.(
    data,
    new AbortController().signal
  );

  return result;
}

export function calculateBoxPlotData(
  data: number[],
  index?: number
): IHighchartBoxData | undefined {
  data.sort((number1: number, number2: number) => {
    return number1 - number2;
  });
  if (data.length === 0) {
    return undefined;
  }
  const firstQuartile = getPercentile(data, 25);
  const median = getPercentile(data, 50);
  const thirdQuartile = getPercentile(data, 75);
  if (
    firstQuartile !== undefined &&
    median !== undefined &&
    thirdQuartile !== undefined
  ) {
    const interquartileRange = thirdQuartile - firstQuartile;
    // calculate fences as min and max allowed values to be inside the box
    const lowerFence = firstQuartile - interquartileRange * 1.5;
    const upperFence = thirdQuartile + interquartileRange * 1.5;
    const nonOutliers = data.filter(
      (element) => element >= lowerFence && element <= upperFence
    );
    const outliers = data.filter(
      (element) => element < lowerFence || element > upperFence
    );
    return {
      high: nonOutliers[nonOutliers.length - 1],
      low: nonOutliers[0],
      median,
      outliers,
      q1: firstQuartile,
      q3: thirdQuartile,
      x: index
    };
  }
  return undefined;
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

export async function setOutlierDataIfChanged(
  boxPlotData: Array<Promise<IHighchartBoxData | undefined>>,
  prevBoxChartState: IBoxChartState,
  onBoxPlotStateUpdate: (boxPlotState: IBoxChartState) => void
): Promise<void> {
  const data = await Promise.all(boxPlotData);
  const outlierData = data
    .map((cohortBoxPlotData) => cohortBoxPlotData?.outliers)
    .map((outlierProbs, cohortIndex) => {
      return outlierProbs?.map((prob) => [cohortIndex, prob]);
    })
    .filter((list) => list !== undefined)
    .reduce((list1, list2) => list1?.concat(list2 || []), []);
  if (
    !_.isEqual(data, prevBoxChartState.boxPlotData) ||
    !_.isEqual(prevBoxChartState.outlierData, outlierData)
  ) {
    onBoxPlotStateUpdate({ boxPlotData: data, outlierData });
  }
}
