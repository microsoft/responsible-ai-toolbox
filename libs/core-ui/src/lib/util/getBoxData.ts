// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { calculateBoxData } from "./calculateBoxData";

export interface IBoxData {
  box: number[][];
  outlier: number[][];
}

export function getBoxData(x: number[], y: number[]): IBoxData {
  const dataSet: number[][] = [];
  x.forEach((value, index) => {
    if (dataSet[value] === undefined) {
      dataSet[value] = [];
    }
    dataSet[value].push(y[index]);
  });
  const result: IBoxData = {
    box: [],
    outlier: []
  };
  const calculatedData = dataSet.map((v) => calculateBoxData(v));
  calculatedData.forEach((temp, index) => {
    result.box.push([
      temp.min,
      temp.lowerPercentile,
      temp.median,
      temp.upperPercentile,
      temp.max
    ]);
    temp.outliers?.forEach((d) => {
      result.outlier.push([index, d]);
    });
  });
  return result;
}
