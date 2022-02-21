// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function groupByFeature(x: number[], featureNumber: number): number[][] {
  const result: number[][] = new Array(x.length / featureNumber).fill([]);
  x.map((v, index) => result[Math.floor(index / featureNumber)].push(v));
  return result;
}
