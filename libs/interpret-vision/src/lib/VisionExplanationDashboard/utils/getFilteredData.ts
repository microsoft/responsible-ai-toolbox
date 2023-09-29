// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IVisionListItem } from "@responsible-ai/core-ui";

export function getFilteredDataFromSearch(
  searchVal: string,
  items: IVisionListItem[],
  taskType: string
): IVisionListItem[] {
  return items.filter((item) => {
    const predOrIncorrectY = taskType === DatasetTaskType.ObjectDetection
      ? item.odIncorrect : item.predictedY;
    const trueOrCorrectY = taskType === DatasetTaskType.ObjectDetection
      ? item.odCorrect : item.trueY;
    const predOrIncorrectYIncludesSearchVal = includesSearchVal(
      predOrIncorrectY,
      searchVal
    );
    const trueOrCorrectYIncludesSearchVal = includesSearchVal(trueOrCorrectY, searchVal);
    return predOrIncorrectYIncludesSearchVal || trueOrCorrectYIncludesSearchVal;
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
