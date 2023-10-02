// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IDataset } from "@responsible-ai/core-ui";

import { fridgeMultilabelImages } from "./fridgeMultilabelImages";

export const fridgeMultilabel: IDataset = {
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
    "Model",
    "ImageLength",
    "YCbCrPositioning",
    "Orientation",
    "ImageWidth"
  ],
  features: [
    [
      100.65330159819138,
      "HDR+ 1.0.220943774z",
      2,
      "Google",
      "Pixel 2 XL",
      4032,
      1,
      1,
      3024
    ],
    [
      103.05057662873294,
      "HDR+ 1.0.220943774z",
      2,
      "Google",
      "Pixel 2 XL",
      4032,
      1,
      1,
      3024
    ],
    [
      98.1199917352222,
      "HDR+ 1.0.220943774z",
      2,
      "Google",
      "Pixel 2 XL",
      4032,
      1,
      1,
      3024
    ],
    [
      104.26360328264136,
      "HDR+ 1.0.220943774z",
      2,
      "Google",
      "Pixel 2 XL",
      4032,
      1,
      1,
      3024
    ],
    [
      102.08869290131815,
      "HDR+ 1.0.220943774z",
      2,
      "Google",
      "Pixel 2 XL",
      4032,
      1,
      1,
      3024
    ],
    [
      99.20243590283671,
      "HDR+ 1.0.220943774z",
      2,
      "Google",
      "Pixel 2 XL",
      4032,
      1,
      1,
      3024
    ],
    [
      102.64630060922646,
      "HDR+ 1.0.220943774z",
      2,
      "Google",
      "Pixel 2 XL",
      4032,
      1,
      1,
      3024
    ],
    [
      97.02252452853655,
      "HDR+ 1.0.220943774z",
      2,
      "Google",
      "Pixel 2 XL",
      4032,
      1,
      1,
      3024
    ],
    [
      96.48332701438913,
      "HDR+ 1.0.220943774z",
      2,
      "Google",
      "Pixel 2 XL",
      4032,
      1,
      1,
      3024
    ],
    [
      96.88715067773184,
      "HDR+ 1.0.220943774z",
      2,
      "Google",
      "Pixel 2 XL",
      4032,
      1,
      1,
      3024
    ]
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
