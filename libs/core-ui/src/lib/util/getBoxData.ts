// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { calculateBoxPlotData } from "./calculateBoxData";

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
  const calculatedData = dataSet.map((v) => calculateBoxPlotData(v));
  calculatedData.forEach((temp, index) => {
    result.box.push([
      temp.lowerFence,
      temp.lowerQuartile,
      temp.median,
      temp.upperQuartile,
      temp.upperFence
    ]);
    temp.outliers?.forEach((d) => {
      result.outlier.push([index, d]);
    });
  });
  return result;
}
