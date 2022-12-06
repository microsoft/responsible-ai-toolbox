// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IVisionListItem } from "@responsible-ai/core-ui";

export function getFilteredDataFromSearch(
  searchVal: string,
  items: IVisionListItem[]
): IVisionListItem[] {
  return items.filter((item) => {
    const predYIncludesSearchVal = includesSearchVal(
      item.predictedY,
      searchVal
    );
    const trueYIncludesSearchVal = includesSearchVal(item.trueY, searchVal);
    return predYIncludesSearchVal || trueYIncludesSearchVal;
  });
}

export function includesSearchVal(
  labels: string | string[],
  searchVal: string
): boolean {
  if (Array.isArray(labels)) {
    return labels.some((label) => label.toLowerCase().includes(searchVal));
  }
  return labels.toLowerCase().includes(searchVal);
}
