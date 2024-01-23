// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IVisionListItem } from "@responsible-ai/core-ui";

import { updateSearchSuccessErrorCounts } from "./searchTextUtils";

export function getFilteredDataFromSearch(
  searchVal: string,
  items: IVisionListItem[],
  taskType: string,
  onSearchUpdated: (successCount: number, errorCount: number) => void
): IVisionListItem[] {
  const filteredItems = items.filter((item) => {
    const predOrIncorrectY =
      taskType === DatasetTaskType.ObjectDetection
        ? item.odIncorrect
        : item.predictedY;
    const trueOrCorrectY =
      taskType === DatasetTaskType.ObjectDetection
        ? item.odCorrect
        : item.trueY;
    const predOrIncorrectYIncludesSearchVal = includesSearchVal(
      predOrIncorrectY,
      searchVal
    );
    const trueOrCorrectYIncludesSearchVal = includesSearchVal(
      trueOrCorrectY,
      searchVal
    );
    return predOrIncorrectYIncludesSearchVal || trueOrCorrectYIncludesSearchVal;
  });
  updateSearchSuccessErrorCounts(onSearchUpdated, filteredItems, taskType);
  return filteredItems;
}

export function includesSearchVal(
  labels: string | string[],
  searchVal: string
): boolean {
  if (Array.isArray(labels)) {
    return labels.some((label) =>
      label.toLocaleLowerCase().includes(searchVal.toLocaleLowerCase())
    );
  }
  return labels.toLocaleLowerCase().includes(searchVal.toLocaleLowerCase());
}
