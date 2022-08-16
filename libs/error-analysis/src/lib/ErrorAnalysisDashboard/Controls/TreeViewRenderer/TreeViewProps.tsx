// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import {
  ICompositeFilter,
  IFilter,
  CohortSource,
  ErrorCohort,
  MetricCohortStats,
  IErrorAnalysisTreeNode,
  ITelemetryEvent
} from "@responsible-ai/core-ui";

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
  telemetryHook?: (message: ITelemetryEvent) => void;
}
