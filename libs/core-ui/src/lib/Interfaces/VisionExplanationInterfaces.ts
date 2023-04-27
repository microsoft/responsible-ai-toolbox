// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType } from "./IDataset";
export interface IVisionExplanationDashboardData {
  task_type: DatasetTaskType;
  true_y: number[] | number[][] | string[];
  predicted_y: number[] | number[][] | string[];
  features?: unknown[][];
  feature_names?: string[];
  class_names: string[];
  images: string[];
  categorical_features?: string[];
  object_detection_predicted_y?: number[][][];
  object_detection_true_y?: number[][][];
}
