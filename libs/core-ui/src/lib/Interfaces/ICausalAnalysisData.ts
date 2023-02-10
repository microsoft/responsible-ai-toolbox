// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComparisonTypes } from "./ComparisonTypes";

export interface ICausalAnalysisData {
  id: string;
  config?: ICausalConfig;
  global_effects?: ICausalAnalysisSingleData[];
  local_effects?: ICausalAnalysisSingleData[][];
  policies?: ICausalPolicy[];
  version?: string;
}

export interface ICausalConfig {
  treatment_features: string[];
}

export interface ICausalPolicyGains {
  recommended_policy_gains: number;
  treatment_gains: {
    [index: string]: number;
  };
}

export interface ICausalPolicyTreeLeaf {
  leaf: true;
  n_samples: number;
  treatment: string;
}
export type ICausalPolicyTreeNode =
  | ICausalPolicyTreeInternal
  | ICausalPolicyTreeLeaf;

export interface ICausalPolicyTreeInternal {
  leaf: false;
  feature: string;
  right_comparison: ComparisonTypes;
  comparison_value: string | number | Array<string | number>;
  left: ICausalPolicyTreeNode;
  right: ICausalPolicyTreeNode;
}

export interface ICausalPolicy {
  treatment_feature: string;
  control_treatment: string;
  local_policies?: Array<{ [key: string]: any }>;
  policy_gains?: ICausalPolicyGains;
  policy_tree?: ICausalPolicyTreeNode;
}

export interface ICausalAnalysisSingleData {
  ci_lower: number;
  ci_upper: number;
  feature: string;
  feature_value?: string;
  outcome?: string;
  p_value: number;
  sample?: number;
  point: number;
  stderr: number;
  zstat: number;
}

export interface ICausalWhatIfData {
  ci_lower: number;
  ci_upper: number;
  pvalue: number;
  point_estimate: number;
  stderr: number;
  zstat?: number;
}
