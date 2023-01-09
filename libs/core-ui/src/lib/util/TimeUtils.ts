// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

interface ITimeBasedValue {
  time: number;
  value: number;
}

export function orderByTime(values: number[], rowIndices: string[]): any[][] {
  return values
    .map((predictedValue: number, idx: number) => {
      return {
        time: Date.parse(rowIndices[idx]),
        value: predictedValue
      } as ITimeBasedValue;
    })
    .sort(
      (objA: ITimeBasedValue, objB: ITimeBasedValue) => objA.time - objB.time
    )
    .map((tbv) => [tbv.time, tbv.value]);
}
