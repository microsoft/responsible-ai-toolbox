// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { noFeature } from "./Constants";

export interface IMatrixLegendState {
  maxError: number;
}

export interface IMatrixFilterState {
  selectedFeature1: string;
  selectedFeature2: string;
  matrixLegendState: IMatrixLegendState;
}

export interface IMatrixAreaState {
  jsonMatrix?: any;
  maxErrorRate: number;
  selectedCells?: boolean[];
  matrixFeature1: string;
  matrixFeature2: string;
}

export function createInitialMatrixFilterState(): IMatrixFilterState {
  return {
    matrixLegendState: { maxError: 0 },
    selectedFeature1: noFeature,
    selectedFeature2: noFeature
  };
}

export function createInitialMatrixAreaState(): IMatrixAreaState {
  return {
    jsonMatrix: undefined,
    matrixFeature1: noFeature,
    matrixFeature2: noFeature,
    maxErrorRate: 0,
    selectedCells: undefined
  };
}
