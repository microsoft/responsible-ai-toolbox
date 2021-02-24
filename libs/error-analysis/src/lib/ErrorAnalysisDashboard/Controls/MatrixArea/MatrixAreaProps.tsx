// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFilter, ICompositeFilter } from "@responsible-ai/core-ui";
import { ITheme } from "office-ui-fabric-react";

import { CohortStats } from "../../CohortStats";
import { ErrorCohort, ErrorDetectorCohortSource } from "../../ErrorCohort";
import { IMatrixAreaState } from "../../MatrixFilterState";

export interface IMatrixAreaProps {
  theme?: ITheme;
  features: string[];
  selectedFeature1: string;
  selectedFeature2: string;
  getMatrix?: (request: any, abortSignal: AbortSignal) => Promise<any>;
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: ErrorDetectorCohortSource,
    cells: number,
    cohortStats: CohortStats | undefined
  ) => void;
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  updateMatrixLegendState: (maxError: number) => void;
  state: IMatrixAreaState;
  setMatrixAreaState: (matrixAreaState: IMatrixAreaState) => void;
}
