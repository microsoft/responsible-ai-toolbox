// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type IMatrixSingleCategory =
  | IMatrixSingleClassificationCategory
  | IMatrixSingleRegressionCategory;

export type IMatrixSingleClassificationCategory = {
  value: number;
  maxIntervalCat?: never;
  minIntervalCat?: never;
};
export type IMatrixSingleRegressionCategory = {
  value: number;
  maxIntervalCat: number;
  minIntervalCat: number;
};
