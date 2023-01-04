// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IDataset } from "@responsible-ai/core-ui";

import { fridgeMultilabelImages } from "./fridgeMultilabelImages";

export const fridgeMultilabel: IDataset = {
  categorical_features: [],
  class_names: ["can", "carton", "milk_bottle", "water_bottle"],
  feature_names: ["mean_pixel_value"],
  features: [
    [100.65330159819138],
    [103.05057662873294],
    [98.1199917352222],
    [104.26360328264136],
    [102.08869290131815],
    [99.20243590283671],
    [102.64630060922646],
    [97.02252452853655],
    [96.48332701438913],
    [96.88715067773184]
  ],
  images: fridgeMultilabelImages,
  predicted_y: [
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [1, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 1]
  ],
  target_column: ["can", "carton", "milk_bottle", "water_bottle"],
  task_type: DatasetTaskType.MultilabelImageClassification,
  true_y: [
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [1, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 0],
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0]
  ]
};
