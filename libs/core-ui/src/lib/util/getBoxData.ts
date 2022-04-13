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
    result.box.push({
      low: temp.lowerFence,
      q1: temp.lowerQuartile,
      median: temp.median,
      q3: temp.upperQuartile,
      high: temp.upperFence
    });
    temp.outliers?.forEach((d) => {
      result.outlier.push([index, d]);
    });
  });
  return result;
}
