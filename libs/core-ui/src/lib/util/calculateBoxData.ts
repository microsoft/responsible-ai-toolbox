// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort } from "../Cohort/ErrorCohort";
import { IHighchartBoxData } from "../Interfaces/IHighchartBoxData";

export function calculateBoxPlotDataFromErrorCohort(
  errorCohort: ErrorCohort,
  index: number,
  key: string
) {
  // key is the identifier for the column (e.g., probability)
  return calculateBoxPlotData(
    errorCohort.cohort.filteredData.map((dict) => dict[key]),
    index
  );
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

export function getPercentile(sortedData: number[], percentile: number) {
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
