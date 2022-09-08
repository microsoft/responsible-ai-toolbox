// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IVisionExplanationDashboardData {
  true_y: number[];
  predicted_y: number[];
  features?: unknown[][];
  feature_names?: string[];
  class_names: string[];
  images: string[];
  categorical_features?: string[];
}
