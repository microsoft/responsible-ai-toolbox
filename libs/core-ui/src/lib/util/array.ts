// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function isTwoDimArray(
  val: number | number[] | number[][]
): val is number[][] {
  return (
    Array.isArray(val) && !val.some((v: number | number[]) => !Array.isArray(v))
  );
}

export function isThreeDimArray(
  val: number[] | number[][] | number[][][]
): val is number[][][] {
  return (
    Array.isArray(val) &&
    !val.some((v: number | number[] | number[][]) => !isTwoDimArray(v))
  );
}
