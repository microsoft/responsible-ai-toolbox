// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IIceChartData } from "./getIceChartOption";

export function mergeXYData(
  xData: any,
  yData: any,
  customData: any,
  isCategorical: boolean
): IIceChartData[] {
  if (xData.length !== yData.length) {
    return [];
  }
  const data: IIceChartData[] = [];
  xData.forEach((x: any, index: number) => {
    data.push(
      isCategorical
        ? { customData: customData[index], y: yData[index] }
        : { customData: customData[index], x, y: yData[index] }
    );
  });
  return data;
}
