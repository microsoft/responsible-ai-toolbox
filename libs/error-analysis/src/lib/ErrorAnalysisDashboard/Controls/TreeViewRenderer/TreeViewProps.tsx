// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICompositeFilter,
  IFilter,
  CohortSource,
  ErrorCohort,
  MetricCohortStats,
  IErrorAnalysisTreeNode
} from "@responsible-ai/core-ui";
import { ITheme } from "office-ui-fabric-react";

import { HelpMessageDict } from "../../Interfaces/IStringsParam";

export interface ITreeViewRendererProps {
  disabledView: boolean;
  theme?: ITheme;
  messages?: HelpMessageDict;
  features: string[];
  selectedFeatures: string[];
  getTreeNodes?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<IErrorAnalysisTreeNode[]>;
  tree?: IErrorAnalysisTreeNode[];
  onClearCohortSelectionClick: () => void;
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: CohortSource,
    cells: number,
    cohortStats: MetricCohortStats | undefined
  ) => void;
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  showCohortName: boolean;
}
