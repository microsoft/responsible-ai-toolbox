// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset } from "@responsible-ai/interpret";
import { IColumn } from "office-ui-fabric-react";

export function constructRows(
  cohortData: Array<{ [key: string]: number }>,
  jointDataset: JointDataset,
  viewedRows: number,
  filterFunction?: (row: { [key: string]: number }) => boolean,
  indexes?: number[]
): any[] {
  const rows = [];
  for (let i = 0; i < viewedRows; i++) {
    let index = i;
    if (indexes) {
      index = indexes[i];
    }
    const row = cohortData[index];
    if (filterFunction && filterFunction(row)) {
      continue;
    }
    const data = JointDataset.datasetSlice(
      row,
      jointDataset.metaDict,
      jointDataset.localExplanationFeatureCount
    );
    rows.push([index, ...data]);
  }
  return rows;
}

export function rowsFromCustomPoints(
  jointDataset: JointDataset,
  customPoints: Array<{ [key: string]: any }>,
  viewedRows: number
): any[] {
  const rows = [];
  for (let i = 0; i < viewedRows; i++) {
    const row = customPoints[i];
    const data = JointDataset.datasetSlice(
      row,
      jointDataset.metaDict,
      jointDataset.localExplanationFeatureCount
    );
    rows.push([i, ...data]);
  }
  return rows;
}

export function constructCols(
  viewedCols: number,
  featureNames: string[]
): IColumn[] {
  const columns: IColumn[] = [];
  columns.push({
    fieldName: "0",
    isResizable: true,
    key: "column0",
    maxWidth: 100,
    minWidth: 50,
    name: "Index"
  });
  for (let i = 0; i < viewedCols; i++) {
    columns.push({
      fieldName: (i + 1).toString(),
      isResizable: true,
      key: "column" + (i + 1),
      maxWidth: 200,
      minWidth: 100,
      name: featureNames[i]
    });
  }
  return columns;
}
