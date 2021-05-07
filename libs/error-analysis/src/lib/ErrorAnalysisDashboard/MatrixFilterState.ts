// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { noFeature } from "./Constants";

export interface IMatrixLegendState {
  maxMetricValue: number;
}

export interface IMatrixFilterState {
  selectedFeature1: string;
  selectedFeature2: string;
  matrixLegendState: IMatrixLegendState;
}

export interface IMatrixAreaState {
  jsonMatrix?: any;
  maxMetricValue: number;
  selectedCells?: boolean[];
  matrixFeature1: string;
  matrixFeature2: string;
  disableClearAll: boolean;
  disableSelectAll: boolean;
}

export function createInitialMatrixFilterState(): IMatrixFilterState {
  return {
    matrixLegendState: { maxMetricValue: 0 },
    selectedFeature1: noFeature,
    selectedFeature2: noFeature
  };
}

export function createInitialMatrixAreaState(): IMatrixAreaState {
  return {
    disableClearAll: true,
    disableSelectAll: false,
    jsonMatrix: undefined,
    matrixFeature1: noFeature,
    matrixFeature2: noFeature,
    maxMetricValue: 0,
    selectedCells: undefined
  };
}
