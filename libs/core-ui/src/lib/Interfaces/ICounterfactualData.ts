// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ICounterfactualData {
  cfs_list: Array<Array<Array<string | number>>>;
  error_message?: string;
  feature_names: string[];
  feature_names_including_target: string[];
  summary_importance?: number[];
  local_importance?: number[][];
  model_type?: string;
  desired_class?: string;
  desired_range?: [number, number];
}
