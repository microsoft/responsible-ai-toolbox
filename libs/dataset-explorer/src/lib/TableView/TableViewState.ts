// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumn, IGroup } from "@fluentui/react";

export interface ITableViewTableState {
  rows: any[];
  columns: IColumn[];
  groups?: IGroup[];
}

export interface IITableViewState extends ITableViewTableState {
  indexToUnselect?: number;
  selectedIndices: number[];
}
