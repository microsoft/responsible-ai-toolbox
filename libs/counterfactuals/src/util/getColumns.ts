// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumn } from "@fluentui/react";
import { ICounterfactualData } from "@responsible-ai/core-ui";

import { getFilterFeatures } from "./getFilterFeatures";
import { getTargetColumnNamePrefix } from "./getTargetColumnNamePrefix";
import { getTargetFeatureName } from "./getTargetFeatureName";

export function getColumns(
  data: ICounterfactualData | undefined,
  selectedIndex: number,
  sortFeatures: boolean,
  filterText: string | undefined,
  nameColumnKey: string,
  renderName: (
    item?: Record<string, string | number>,
    index?: number | undefined
  ) => JSX.Element
): IColumn[] {
  const columns: IColumn[] = [];
  const targetFeature = getTargetFeatureName(data);
  const featureNames = getFilterFeatures(
    data,
    selectedIndex,
    sortFeatures,
    filterText
  );
  if (!featureNames || featureNames.length === 0) {
    return columns;
  }
  columns.push(
    {
      fieldName: nameColumnKey,
      isResizable: true,
      key: nameColumnKey,
      minWidth: 200,
      name: "",
      onRender: renderName
    },
    {
      fieldName: targetFeature,
      isResizable: true,
      key: targetFeature || "",
      minWidth: 175,
      name: targetFeature || ""
    }
  );
  featureNames
    .filter((f) => f !== targetFeature)
    .forEach((f) =>
      columns.push({
        fieldName: f,
        isResizable: true,
        key: f,
        minWidth: 175,
        name: f
      })
    );
  for (const column of columns) {
    if (targetFeature !== undefined && column.fieldName === targetFeature) {
      column.name = `${getTargetColumnNamePrefix(data?.desired_range)} (${
        column.fieldName
      })`;
    }
  }
  return columns;
}
