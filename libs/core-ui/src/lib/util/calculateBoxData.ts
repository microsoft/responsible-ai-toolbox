// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHighchartBoxData } from "../Interfaces/IHighchartBoxData";
import { ErrorCohort } from "@responsible-ai/core-ui";

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

export function calculateBoxPlotData(data: number[], index?: number): IHighchartBoxData {
  data.sort((number1: number, number2: number) => {
    return number1 - number2;
  });
  const min = data[0];
  const max = data[data.length - 1];
  const firstQuartile = getPercentile(data, 25);
  const median = getPercentile(data, 50);
  const thirdQuartile = getPercentile(data, 75);
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
    upperFence: nonOutliers[nonOutliers.length - 1],
    lowerFence: nonOutliers[0],
    max,
    median,
    mean: mean(data),
    min,
    outliers,
    lowerQuartile: firstQuartile,
    upperQuartile: thirdQuartile,
    x: index
  };
}

function getPercentile(sortedData: number[], percentile: number) {
  const index = (percentile / 100) * sortedData.length;
  let result;
  if (Math.floor(index) === index) {
    result = (sortedData[index - 1] + sortedData[index]) / 2;
  } else {
    result = sortedData[Math.floor(index)];
  }
  return result;
}

function mean(data: number[]) {
  let sum = 0;
  data.forEach((d) => (sum += d));
  return sum / data.length;
}
