// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ICounterfactualData {
  // TODO: remove featureNames when sdk integration
  cfs_list: number[][][];
  feature_names: string[];
  feature_names_including_target: string[];
  summary_importance: number[];
  local_importance: number[][];
  model_type: string;
  desired_class: string;
  desired_range: [number, number];
}
