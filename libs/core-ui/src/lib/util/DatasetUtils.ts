// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ColumnActionsMode, IColumn } from "@fluentui/react";

import { JointDataset } from "../util/JointDataset";

export interface ITableState {
  rows: any[];
  columns: IColumn[];
}

export function areRowPredTrueLabelsEqual(
  row: { [key: string]: number },
  jointDataset: JointDataset
): boolean {
  if (jointDataset.numLabels === 1) {
    return row[JointDataset.PredictedYLabel] === row[JointDataset.TrueYLabel];
  }
  for (let i = 0; i < jointDataset.numLabels; i++) {
    const predLabel = row[JointDataset.PredictedYLabel + i.toString()];
    const trueLabel = row[JointDataset.TrueYLabel + i.toString()];
    if (predLabel !== trueLabel) {
      return false;
    }
  }
  return true;
}

export function constructRows(
  cohortData: Array<{ [key: string]: number }>,
  jointDataset: JointDataset,
  viewedRows: number,
  filterFunction?: (row: { [key: string]: number }) => boolean,
  indexes?: number[],
  colors?: string[]
): any[] {
  const rows = [];
  for (let i = 0; i < viewedRows; i++) {
    let index: number;
    if (indexes) {
      index = indexes[i];
    } else {
      index = cohortData[i][JointDataset.IndexLabel];
    }
    const row = jointDataset.getRow(index);
    if (filterFunction && filterFunction(row)) {
      continue;
    }
    const data = JointDataset.datasetSlice(
      row,
      jointDataset.metaDict,
      jointDataset.datasetFeatureCount
    );
    const tableRow = [];
    tableRow.push(row[JointDataset.IndexLabel]);
    if (colors) {
      tableRow.push(colors[i]);
    }
    if (jointDataset.hasTrueY) {
      if (jointDataset.numLabels > 1) {
        pushMultilabelRowData(
          tableRow,
          JointDataset.TrueYLabel,
          jointDataset,
          row
        );
      } else {
        pushRowData(tableRow, JointDataset.TrueYLabel, jointDataset, row);
      }
    }
    if (jointDataset.hasPredictedY) {
      if (jointDataset.numLabels > 1) {
        pushMultilabelRowData(
          tableRow,
          JointDataset.PredictedYLabel,
          jointDataset,
          row
        );
      } else {
        pushRowData(tableRow, JointDataset.PredictedYLabel, jointDataset, row);
      }
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
  isCustomPointsView: boolean,
  hasColors = false
): IColumn[] {
  const columns: IColumn[] = [];
  columns.push({
    columnActionsMode: ColumnActionsMode.disabled,
    fieldName: "0",
    isResizable: true,
    key: "column0",
    maxWidth: 100,
    minWidth: 50,
    name: "Index"
  });
  let index = 1;
  if (hasColors) {
    columns.push({
      columnActionsMode: ColumnActionsMode.disabled,
      fieldName: `${index}`,
      isResizable: true,
      key: "color",
      maxWidth: 100,
      minWidth: 50,
      name: "Color"
    });
    index++;
  }
  if (!isCustomPointsView && jointDataset.hasTrueY) {
    columns.push({
      columnActionsMode: ColumnActionsMode.disabled,
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
      columnActionsMode: ColumnActionsMode.disabled,
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
      columnActionsMode: ColumnActionsMode.disabled,
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

function pushRowData(
  tableRow: any[],
  property: string,
  jointDataset: JointDataset,
  row: { [key: string]: number }
): void {
  const categories = jointDataset.metaDict[property]?.sortedCategoricalValues;
  if (jointDataset.metaDict[property].isCategorical && categories) {
    tableRow.push(categories[row[property]]);
  } else {
    tableRow.push(row[property]);
  }
}

function pushMultilabelRowData(
  tableRow: any[],
  property: string,
  jointDataset: JointDataset,
  row: { [key: string]: number }
): void {
  const values = [];
  for (let i = 0; i < jointDataset.numLabels; i++) {
    const labelProp = property + i.toString();
    const categories =
      jointDataset.metaDict[labelProp]?.sortedCategoricalValues;
    if (jointDataset.metaDict[labelProp].isCategorical && categories) {
      const value = categories[row[labelProp]];
      if (value) {
        values.push(value);
      }
    } else {
      const value = row[labelProp];
      if (value) {
        values.push(value);
      }
    }
  }
  tableRow.push(values.join(","));
}
