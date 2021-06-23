// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ICausalAnalysisData {
  global_effects: ICausalAnalysisSingleData[];
  local_effects: ICausalAnalysisSingleData[][];
  policies?: ICausalPolicy;
}

export interface ICausalPolicyGains {
  recommended_policy_gains: number;
  treatment_gains: number[];
}

export interface ICausalPolicyTreeLeaf {
  leaf: true;
  n_samples: number;
  treatment: string;
}

export interface ICausalPolicyTreeInternal {
  leaf: false;
  feature: string;
  threshold: number | string;
  left: ICausalPolicyTreeInternal | ICausalPolicyTreeLeaf;
  right: ICausalPolicyTreeInternal | ICausalPolicyTreeLeaf;
}

export interface ICausalPolicy {
  treatment_feature: string;
  local_policies?: unknown[];
  policy_gains?: ICausalPolicyGains;
  policy_tree?: ICausalPolicyTreeInternal | ICausalPolicyTreeLeaf;
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
