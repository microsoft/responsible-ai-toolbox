// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IDataset } from "@responsible-ai/core-ui";

import { fridge } from "./fridge";
import { fridgeImages } from "./fridgeImages";

export const fridgeBinary: IDataset = {
  categorical_features: ["Software", "Make", "Model"],
  class_names: ["can", "carton", "milk_bottle", "water_bottle"],
  feature_metadata: {
    categorical_features: ["Software", "Make", "Model"]
  },
  feature_names: [
    "mean_pixel_value",
    "Software",
    "ResolutionUnit",
    "Make",
    "GPSInfo",
    "ImageLength",
    "ExifOffset",
    "Model",
    "YCbCrPositioning",
    "Orientation",
    "ImageWidth"
  ],
  features: [
    [
      fridge.features[0][0],
      "HDR+ 1.0.220943774z",
      "Google",
      2,
      31313,
      4032,
      244,
      "Pixel 2 XL",
      1,
      1,
      3024
    ],
    [
      fridge.features[1][0],
      "HDR+ 1.0.220943774z",
      "Google",
      2,
      undefined,
      4032,
      232,
      "Pixel 2 XL",
      1,
      1,
      3024
    ],
    [
      fridge.features[2][0],
      "HDR+ 1.0.220943774z",
      "Google",
      2,
      33275,
      4032,
      244,
      "Pixel 2 XL",
      1,
      1,
      3024
    ],
    [
      fridge.features[3][0],
      "HDR+ 1.0.220943774z",
      "Google",
      2,
      31559,
      4032,
      244,
      "Pixel 2 XL",
      1,
      1,
      3024
    ],
    [
      fridge.features[34][0],
      "HDR+ 1.0.220943774z",
      "Google",
      2,
      undefined,
      4032,
      232,
      "Pixel 2 XL",
      1,
      1,
      3024
    ]
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
