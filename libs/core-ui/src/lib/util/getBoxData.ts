// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { calculateBoxData } from "./calculateBoxData";

export function getBoxData(x: number[], y: number[]): number[][] {
  const dataSet: number[][] = [];
  x.forEach((value, index) => {
    if (dataSet[value] === undefined) {
      dataSet[value] = [];
    }
    dataSet[value].push(y[index]);
  });
  const result: number[][] = [];
  const calculatedData = dataSet.map((v) => calculateBoxData(v));
  calculatedData.forEach((temp) => {
    result.push([
      temp.min,
      temp.lowerPercentile,
      temp.median,
      temp.upperPercentile,
      temp.max
    ]);
  });
  return result;
}
