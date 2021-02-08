// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumn } from "office-ui-fabric-react";

import { JointDataset } from "@responsible-ai/core-ui";

export function constructRows(
  cohortData: Array<{ [key: string]: number }>,
  jointDataset: JointDataset,
  viewedRows: number,
  filterFunction?: (row: { [key: string]: number }) => boolean,
  indexes?: number[]
): any[] {
  const rows = [];
  for (let i = 0; i < viewedRows; i++) {
    let index = cohortData[i][JointDataset.IndexLabel];
    if (indexes) {
      index = indexes[i];
    }
    const row = jointDataset.getRow(index);
    if (filterFunction && filterFunction(row)) {
      continue;
    }
    const data = JointDataset.datasetSlice(
      row,
      jointDataset.metaDict,
      jointDataset.localExplanationFeatureCount
    );
    const tableRow = [];
    tableRow.push(row[JointDataset.IndexLabel]);
    if (jointDataset.hasTrueY) {
      tableRow.push(row[JointDataset.TrueYLabel]);
    }
    if (jointDataset.hasPredictedY) {
      tableRow.push(row[JointDataset.PredictedYLabel]);
    }
    tableRow.push(...data);
    rows.push(tableRow);
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
  featureNames: string[],
  jointDataset: JointDataset,
  isCustomPointsView: boolean
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
  let index = 1;
  if (!isCustomPointsView && jointDataset.hasTrueY) {
    columns.push({
      fieldName: `${index}`,
      isResizable: true,
      key: `column${index}`,
      maxWidth: 100,
      minWidth: 50,
      name: "TrueY"
    });
    index++;
  }
  if (!isCustomPointsView && jointDataset.hasPredictedY) {
    columns.push({
      fieldName: `${index}`,
      isResizable: true,
      key: `column${index}`,
      maxWidth: 100,
      minWidth: 50,
      name: "PredictedY"
    });
    index++;
  }
  for (let i = 0; i < viewedCols; i++) {
    columns.push({
      fieldName: `${index}`,
      isResizable: true,
      key: `column${index}`,
      maxWidth: 200,
      minWidth: 100,
      name: featureNames[i]
    });
    index += 1;
  }
  return columns;
}
