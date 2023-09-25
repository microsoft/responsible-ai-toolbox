// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IDataset } from "@responsible-ai/core-ui";

import { fridgeMultilabelImages } from "./fridgeMultilabelImages";

export const fridgeMultilabel: IDataset = {
  categorical_features: ["Make", "Software", "Model"],
  class_names: ["can", "carton", "milk_bottle", "water_bottle"],
  feature_metadata: {
    categorical_features: ["Make", "Software", "Model"]
  },
  feature_names: ["mean_pixel_value", "Make", "Software", "Model"],
  features: [
    [100.65330159819138, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [103.05057662873294, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [98.1199917352222, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [104.26360328264136, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [102.08869290131815, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [99.20243590283671, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [102.64630060922646, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [97.02252452853655, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [96.48332701438913, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [96.88715067773184, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"]
  ],
  images: fridgeMultilabelImages,
  predicted_y: [
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [1, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 0],
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
