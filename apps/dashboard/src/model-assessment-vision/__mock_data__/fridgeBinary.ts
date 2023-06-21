// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IDataset } from "@responsible-ai/core-ui";

import { fridge } from "./fridge";
import { fridgeImages } from "./fridgeImages";

export const fridgeBinary: IDataset = {
  categorical_features: [],
  class_names: ["can", "carton"],
  feature_names: ["mean_pixel_value"],
  features: [
    fridge.features[0],
    fridge.features[1],
    fridge.features[2],
    fridge.features[3],
    fridge.features[34]
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
