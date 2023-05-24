// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IVisionListItem } from "@responsible-ai/core-ui";

export interface IVisionExplanationDashboardState {
  computedExplanations: Map<number, Map<number, string>>;
  errorInstances: IVisionListItem[];
  successInstances: IVisionListItem[];
  imageDim: number;
  loadingExplanation: boolean[][];
  otherMetadataFieldNames: string[];
  numRows: number;
  pageSize: number;
  panelOpen: boolean;
  searchValue: string;
  selectedIndices: number[];
  selectedItem: IVisionListItem | undefined;
  selectedKey: string;
}
