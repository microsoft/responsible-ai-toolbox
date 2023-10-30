// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { isItemPredTrueEqual } from "../utils/labelUtils";

export function sortKeys(
  keys: string[],
  items: Map<string, any[]>,
  taskType: string
): string[] {
  return keys.sort((a, b) => {
    const aItems = items.get(a);
    const bItems = items.get(b);
    const aCount = aItems?.filter(
      (item) => !isItemPredTrueEqual(item, taskType)
    ).length;
    const bCount = bItems?.filter(
      (item) => !isItemPredTrueEqual(item, taskType)
    ).length;
    if (aCount === bCount) {
      return a > b ? 1 : -1;
    }
    return !aCount || !bCount ? 0 : bCount - aCount;
  });
}
