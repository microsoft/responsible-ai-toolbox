// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DatasetTaskType,
  IVisionListItem,
  NoLabel
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export function getSearchTextAriaLabel(
  successCount: number,
  totalCount: number,
  searchValue: string
): string {
  const failureCount = totalCount - successCount;
  if (!searchValue) {
    return localization.InterpretVision.Search.defaultSearchLabel;
  }
  if (totalCount === 0) {
    return localization.formatString(
      localization.InterpretVision.Search.emptySearchResultsAriaLabel,
      searchValue
    );
  }
  return localization.formatString(
    localization.InterpretVision.Search.searchResultsAriaLabel,
    totalCount,
    searchValue,
    successCount,
    failureCount
  );
}

export function getCorrectCountForItems(
  items: IVisionListItem[],
  taskType: string
): number {
  let count = 0;
  items.forEach((itemEntry) => {
    if (taskType === DatasetTaskType.ObjectDetection) {
      // For object detection, we define correct images as
      // those with no incorrect bounding boxes
      count += itemEntry.odIncorrect === NoLabel ? 1 : 0;
    } else {
      count += itemEntry.predictedY === itemEntry.trueY ? 1 : 0;
    }
  });
  return count;
}

export function updateSearchSuccessErrorCounts(
  onSearchUpdated: (successCount: number, errorCount: number) => void,
  examples: IVisionListItem[],
  taskType: string
): void {
  const successCount = getCorrectCountForItems(examples, taskType);
  const errorCount = examples.length - successCount;
  onSearchUpdated(successCount, errorCount);
}

export function updateSearchTextAriaLabel(
  onSearchUpdated: (searchResultsAriaLabel: string) => void,
  successCount: number,
  errorCount: number,
  searchValue: string
): void {
  const totalCount = successCount + errorCount;
  const searchResultsAriaLabel = getSearchTextAriaLabel(
    successCount,
    totalCount,
    searchValue
  );
  onSearchUpdated(searchResultsAriaLabel);
}
