// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHighchartBoxData } from "../Interfaces/IHighchartBoxData";

export function calculateBoxData(data: number[]): IHighchartBoxData {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const q1 = getPercentile(data, 25);
  const median = getPercentile(data, 50);
  const q3 = getPercentile(data, 75);
  const iqr = q3 - q1;
  const lowerFence = q1 - iqr * 1.5;
  const upperFence = q3 + iqr * 1.5;
  const outliers = [];

  for (const datum of data) {
    if (datum < lowerFence || datum > upperFence) {
      outliers.push(datum);
    }
  }
  return {
    lowerPercentile: q1,
    max,
    mean: mean(data),
    median,
    min,
    outliers,
    upperPercentile: q3
  };
}

function getPercentile(data: number[], percentile: number): number {
  data.sort((a, b) => a - b);
  const index = (percentile / 100) * data.length;
  if (Math.floor(index) === index) {
    return (data[index - 1] + data[index]) / 2;
  }
  return data[Math.floor(index)];
}

function mean(data: number[]) {
  let sum = 0;
  data.forEach((d) => (sum += d));
  return sum / data.length;
}
