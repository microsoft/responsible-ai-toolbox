// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumnRange } from "@responsible-ai/mlchartlib";

import { getColumnItems, maxLength } from "./CohortEditorPanelContentUtils";

export function getColumnLabel(
  column: string,
  columnRanges?: {
    [key: string]: IColumnRange;
  }
): string {
  const items = getColumnItems(columnRanges);
  let label;
  items.forEach((item) => {
    if (item.key === column) {
      label = item.text;
    }
  });
  if (label === undefined) {
    return column.length <= maxLength
      ? column
      : `${column.slice(0, maxLength)}...`;
  }
  return label;
}
