// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import {
  IFilter,
  ICompositeFilter,
  CohortSource,
  ErrorCohort,
  MetricCohortStats,
  IErrorAnalysisMatrix,
  ITelemetryEvent
} from "@responsible-ai/core-ui";

export interface IMatrixAreaProps {
  theme?: ITheme;
  features: string[];
  selectedFeature1?: string;
  selectedFeature2?: string;
  isEnabled: boolean;
  getMatrix?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<IErrorAnalysisMatrix>;
  matrix?: IErrorAnalysisMatrix;
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: CohortSource,
    cells: number,
    cohortStats: MetricCohortStats | undefined
  ) => void;
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  updateMatrixLegendState: (maxMetric: number, isErrorMetric: boolean) => void;
  metric: string | undefined;
  telemetryHook?: (message: ITelemetryEvent) => void;
}
