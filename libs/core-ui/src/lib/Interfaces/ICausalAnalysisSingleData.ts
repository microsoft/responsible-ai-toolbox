// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ICausalAnalysisSingleData {
  ci_lower: number;
  ci_upper: number;
  feature: string;
  p_value: number;
  point: number;
  stderr: number;
  zstat: number;
}
