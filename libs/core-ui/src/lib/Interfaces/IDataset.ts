// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IDataset {
  task_type: "classification" | "regression";
  true_y: number[];
  predicted_y?: number[];
  probability_y?: number[][];
  features: any[][];
  feature_names: string[];
  categorical_map?: { [key: number]: string[] };
  class_names?: string[];
}

// TODO Remove DatasetSummary when possible
export interface IDatasetSummary {
  featureNames?: string[];
  classNames?: string[];
  categoricalMap?: { [key: number]: string[] };
}
