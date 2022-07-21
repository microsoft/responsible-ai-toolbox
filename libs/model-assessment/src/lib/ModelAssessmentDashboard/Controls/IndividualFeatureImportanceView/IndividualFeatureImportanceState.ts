// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumn, IGroup, IObjectWithKey } from "@fluentui/react";

export interface IIndividualFeatureImportanceTableState {
  rows: any[];
  columns: IColumn[];
  groups?: IGroup[];
}

export interface IIndividualFeatureImportanceState
  extends IIndividualFeatureImportanceTableState {
  allSelectedItems: IObjectWithKey[];
  indexToUnselect?: number;
  selectedIndices: number[];
}
