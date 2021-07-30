// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFilter,
  ICompositeFilter,
  CohortSource,
  ErrorCohort,
  MetricCohortStats,
  IErrorAnalysisMatrix
} from "@responsible-ai/core-ui";
import { ITheme } from "office-ui-fabric-react";

import { IMatrixAreaState } from "../../MatrixFilterState";

export interface IMatrixAreaProps {
  theme?: ITheme;
  features: string[];
  selectedFeature1?: string;
  selectedFeature2?: string;
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
  updateMatrixLegendState: (maxError: number) => void;
  state: IMatrixAreaState;
  setMatrixAreaState: (matrixAreaState: IMatrixAreaState) => void;
}
