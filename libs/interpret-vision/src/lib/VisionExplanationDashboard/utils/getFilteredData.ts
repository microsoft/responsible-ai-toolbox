// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IVisionListItem } from "@responsible-ai/core-ui";

export function getFilteredDataFromSearch(
  searchVal: string,
  items: IVisionListItem[]
): IVisionListItem[] {
  return items.filter(
    (item) =>
      item.predictedY.toLowerCase().includes(searchVal) ||
      item.trueY.toLowerCase().includes(searchVal)
  );
}
