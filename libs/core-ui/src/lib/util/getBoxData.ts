// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { calculateBoxData } from "./calculateBoxData";

export function getBoxData(x: number[], y: number[]): number[][] {
  const result = [];
  let i = 0;
  while (i < x.length && i < y.length) {
    let j = i;
    while (j < x.length && x[i] === x[j]) j++;
    const temp = calculateBoxData(y.splice(i, j));
    result.push([
      temp.min,
      temp.lowerPercentile,
      temp.median,
      temp.upperPercentile,
      temp.max
    ]);
    i = j;
  }
  return result;
}
