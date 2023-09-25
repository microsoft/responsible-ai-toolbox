// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IDataset } from "@responsible-ai/core-ui";

import { fridge } from "./fridge";
import { fridgeImages } from "./fridgeImages";

export const fridgeBinary: IDataset = {
  categorical_features: ["Make", "Software", "Model"],
  class_names: ["can", "carton"],
  feature_metadata: {
    categorical_features: ["Make", "Software", "Model"]
  },
  feature_names: ["mean_pixel_value", "Make", "Software", "Model"],
  features: [
    [fridge.features[0][0], "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [fridge.features[1][0], "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [fridge.features[2][0], "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [fridge.features[3][0], "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [fridge.features[34][0], "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"]
  ],
  images: [
    fridgeImages[0],
    fridgeImages[1],
    fridgeImages[2],
    fridgeImages[3],
    fridgeImages[34]
  ],
  predicted_y: [0, 0, 0, 0, 1],
  target_column: "label",
  task_type: DatasetTaskType.ImageClassification,
  true_y: [0, 0, 0, 0, 1]
};
