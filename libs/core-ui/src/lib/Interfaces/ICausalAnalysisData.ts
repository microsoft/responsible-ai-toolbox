// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ICausalAnalysisData {
  global_effects: ICausalAnalysisSingleData[];
  local_effects: ICausalAnalysisSingleData[][];
  policy?: ICausalAnalysisTreatmentPolicy;
}
export interface ICausalAnalysisSingleData {
  ci_lower: number;
  ci_upper: number;
  feature: string;
  p_value: number;
  point: number;
  stderr: number;
  zstat: number;
}
export interface ICausalAnalysisTreatmentPolicy {
  local_policies: ICausalAnalysisLocalPolicy;
  policy_tree: ICausalAnalysisPolicyTree;
  policy_gains: ICausalAnalysisPolicyGains;
}

export interface ICausalAnalysisLocalPolicy {}
export interface ICausalAnalysisPolicyTree {}
export interface ICausalAnalysisPolicyGains {}
