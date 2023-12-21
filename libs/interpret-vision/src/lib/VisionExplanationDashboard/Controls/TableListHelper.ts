// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IGroup, IColumn } from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";

import { ISearchable } from "../Interfaces/ISearchable";

export interface ITableListProps extends ISearchable {
  addCohort: (name: string, switchCohort: boolean) => void;
  errorInstances: IVisionListItem[];
  successInstances: IVisionListItem[];
  imageDim: number;
  otherMetadataFieldNames: string[];
  selectItem: (item: IVisionListItem) => void;
  updateSelectedIndices: (indices: number[]) => void;
  taskType: string;
  onSearchUpdated: (successCount: number, errorCount: number) => void;
}

export interface ITableListState {
  filteredGroups: IGroup[];
  filteredItems: IVisionListItem[];
  groups: IGroup[];
  columns: IColumn[];
}

export const defaultState: ITableListState = {
  columns: [],
  filteredGroups: [],
  filteredItems: [],
  groups: []
};
