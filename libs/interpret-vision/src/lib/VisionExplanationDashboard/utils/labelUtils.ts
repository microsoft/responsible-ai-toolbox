// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IVisionListItem } from "@responsible-ai/core-ui";

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

export function isItemPredTrueEqual(item: IVisionListItem): boolean {
  return (
    getJoinedLabelString(item.predictedY) === getJoinedLabelString(item.trueY)
  );
}
