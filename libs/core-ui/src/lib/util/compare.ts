// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function compare(a: string | number | number[], b: string | number | number[]): 1 | 0 | -1 {
  if (Array.isArray(a) && Array.isArray(b)) {
    // comparing labels in the object detection case
    return compare(a[0], b[0]);
  }
  else if (Array.isArray(a) || Array.isArray(b)) {
    throw new Error("Internal Error: compare function's arguments cannot be of different types.");
  }
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}
