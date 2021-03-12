// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IGlobalExplanationProps {
  globalImportanceIntercept: number[];
  globalImportance: number[][];
  isGlobalImportanceDerivedFromLocal: boolean;
}
