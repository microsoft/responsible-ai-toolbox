// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getSelectedItemIndex(item: unknown): number {
  if (!Array.isArray(item) || typeof item[0] !== "number") {
    throw new TypeError(
      "Expected the selected table item to contain a row index."
    );
  }
  return item[0];
}
