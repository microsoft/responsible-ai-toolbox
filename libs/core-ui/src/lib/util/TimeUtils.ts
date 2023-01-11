// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function orderByTime(
  values: number[],
  rowIndices: string[]
): Array<[number, number]> {
  return values
    .map((predictedValue: number, idx: number) => {
      return [Date.parse(rowIndices[idx]), predictedValue] as [number, number];
    })
    .sort(
      (objA: [number, number], objB: [number, number]) => objA[0] - objB[1]
    );
}
