// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IVisionListItem } from "@responsible-ai/core-ui";

const NoLabel = "(none)";

export function getJoinedLabelString(
  labels: string | string[] | undefined
): string {
  if (!labels) {
    return "";
  } else if (Array.isArray(labels)) {
    return labels.length === 0 ? NoLabel : labels.join(", ");
  }
  return labels;
}

export function isItemPredTrueEqual(
  item: IVisionListItem,
  taskType: string
): boolean {
  return taskType === DatasetTaskType.ObjectDetection
    ? getJoinedLabelString(item.predictedY) === getJoinedLabelString(item.trueY)
    : item.odIncorrect === NoLabel;
}
