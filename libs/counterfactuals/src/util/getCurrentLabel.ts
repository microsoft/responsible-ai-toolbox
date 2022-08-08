// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getCurrentLabel(
  taskType: "classification" | "regression" | "text_classification",
  desiredRange?: [number, number],
  desiredClass?: string
): string {
  if (taskType === "regression") {
    return `[${desiredRange}]`;
  }

  return desiredClass || "";
}
