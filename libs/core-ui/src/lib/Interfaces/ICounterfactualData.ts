// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ICounterfactualData {
  id: string;
  cfs_list: Array<Array<Array<string | number>>>;
  errorMessage?: string;
  feature_names: string[];
  feature_names_including_target: string[];
  summary_importance?: number[];
  local_importance?: number[][];
  model_type?: string;
  desired_class?: string;
  desired_range?: [number, number];
  test_data: Array<Array<string | number>>;
}
