// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PointOptionsObject } from "highcharts";

import { calculateBoxPlotData } from "./calculateBoxData";

export interface IBoxData {
  box: PointOptionsObject[];
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
    if (temp) {
      result.box.push({
        high: temp.high,
        low: temp.low,
        median: temp.median,
        q1: temp.q1,
        q3: temp.q3
      });
      temp.outliers?.forEach((d) => {
        result.outlier.push([index, d]);
      });
    }
  });
  return result;
}
