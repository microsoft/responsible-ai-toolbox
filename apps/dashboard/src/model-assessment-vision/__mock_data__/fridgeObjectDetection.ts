// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetTaskType, IDataset } from "@responsible-ai/core-ui";

import { fridgeObjectDetectionImages } from "./fridgeObjectDetectionImages";

export const fridgeObjectDetection: IDataset = {
  categorical_features: ["Make", "Software", "Model"],
  class_names: ["can", "carton", "milk_bottle", "water_bottle"],
  feature_metadata: {
    categorical_features: ["Make", "Software", "Model"]
  },
  feature_names: ["mean_pixel_value", "Make", "Software", "Model"],
  features: [
    [96.30899737412763, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [95.32630225415797, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [100.3762680516188, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [92.000130390912, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"],
    [95.33849179841164, "Google", "HDR+ 1.0.220943774z", "Pixel 2 XL"]
  ],
  imageDimensions: [
    [499, 666],
    [499, 666],
    [499, 666],
    [499, 666],
    [499, 666]
  ],
  images: fridgeObjectDetectionImages,
  object_detection_predicted_y: [
    [
      [
        3, 37.834022521972656, 312.5594787597656, 323.2925109863281,
        420.728454589844, 0.9872298836708069
      ],
      [
        1, 314.43621826171875, 283.4221496582031, 449.1330261230469,
        453.67205810546875, 0.9839074611663818
      ]
    ],
    [
      [
        3, 97.42891693115234, 272.9599914550781, 231.2677764892578,
        533.6878662109375, 0.996311604976654
      ],
      [
        1, 218.88287353515625, 291.83258056640625, 431.8615417480469,
        403.671691894531, 0.9898059964179993
      ]
    ],
    [
      [
        2, 47.880287170410156, 146.5001831054688, 212.69313049316406,
        513.9315795898438, 0.9914382696151733
      ],
      [
        4, 322.61370849609375, 173.3768920898438, 455.5107421875,
        498.9791564941406, 0.9787105917930603
      ]
    ],
    [
      [
        1, 323.8299865722656, 207.12034606933594, 457.8669738769531,
        412.123779296875, 0.9933412671089172
      ],
      [
        3, 52.82023239135742, 306.5950927734375, 363.34197998046875,
        420.689697265625, 0.979895830154419
      ]
    ],
    [
      [
        2, 211.66485595703125, 130.76492309570312, 391.742919921875,
        507.566650390625, 0.9822636246681213
      ],
      [
        4, 98.31806182861328, 172.11666870117188, 224.2011108398438,
        483.5189208984375, 0.9667745232582092
      ]
    ]
  ],
  object_detection_true_y: [
    [
      [3, 35, 314, 324, 416, 0],
      [1, 313, 281, 449, 456, 0]
    ],
    [
      [3, 97, 272, 230, 528, 0],
      [1, 225, 293, 429, 402, 0]
    ],
    [
      [2, 56, 148, 209, 514, 0],
      [4, 328, 180, 449, 502, 0]
    ],
    [
      [3, 47, 308, 346, 418, 0],
      [1, 331, 205, 458, 410, 0]
    ],
    [
      [4, 98, 176, 219, 496, 0],
      [2, 220, 130, 392, 505, 0]
    ]
  ],
  objectDetectionLabels: [
    {
      aggregate: "2 correct, 0 incorrect",
      correct: "1 milk_bottle, 1 can",
      incorrect: "None"
    },
    {
      aggregate: "2 correct, 0 incorrect",
      correct: "1 milk_bottle, 1 can",
      incorrect: "None"
    },
    {
      aggregate: "2 correct, 0 incorrect",
      correct: "1 carton, 1 water_bottle",
      incorrect: "None"
    },
    {
      aggregate: "2 correct, 0 incorrect",
      correct: "1 can, 1 milk_bottle",
      incorrect: "None"
    },
    {
      aggregate: "2 correct, 0 incorrect",
      correct: "1 carton, 1 water_bottle",
      incorrect: "None"
    }
  ],
  predicted_y: [
    [1, 0, 1, 0],
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 0, 1, 0],
    [0, 1, 0, 1]
  ],
  target_column: "label",
  task_type: DatasetTaskType.ObjectDetection,
  true_y: [
    [1, 0, 1, 0],
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 0, 1, 0],
    [0, 1, 0, 1]
  ]
};
