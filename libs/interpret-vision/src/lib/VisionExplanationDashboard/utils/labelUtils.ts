// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IVisionListItem } from "@responsible-ai/core-ui";

export function getJoinedLabelString(
  labels: string | string[] | undefined
): string {
  if (!labels) {
    return "";
  }
  return Array.isArray(labels) ? labels.join(", ") : labels;
}

export function isItemPredTrueEqual(item: IVisionListItem): boolean {
  return (
    getJoinedLabelString(item.predictedY) === getJoinedLabelString(item.trueY)
  );
}
