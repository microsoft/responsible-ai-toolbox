// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function roundDecimal(value: number): number {
  return value % 1 !== 0 ? Math.round(value * 10000) / 10000 : value;
}
