// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType } from "./IDataset";
export interface IVisionExplanationDashboardData {
  task_type: DatasetTaskType;
  true_y: number[] | number[][];
  predicted_y: number[] | number[][];
  features?: unknown[][];
  feature_names?: string[];
  class_names: string[];
  images: string[];
  categorical_features?: string[];
}
