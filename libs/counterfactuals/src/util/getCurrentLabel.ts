// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType } from "@responsible-ai/core-ui";

export function getCurrentLabel(
  taskType: DatasetTaskType,
  desiredRange?: [number, number],
  desiredClass?: string
): string {
  if (taskType === DatasetTaskType.Regression) {
    return `[${desiredRange}]`;
  }

  return desiredClass || "";
}
