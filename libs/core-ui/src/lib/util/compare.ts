// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function compare(a: string | number, b: string | number): 1 | 0 | -1 {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}
