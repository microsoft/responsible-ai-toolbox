// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  //IVisionExplanationDashboardData,
  IDataset,
  IModelExplanationData
} from "@responsible-ai/core-ui";

import { explanation } from "./explanation";

export const visionModelAssessmentData: IDataset = {
  categorical_features: [],
  class_names: ["Water Tower", "not Water Tower"],
  feature_names: [],
  features: [],
  predicted_y: [],
  probability_y: [],
  target_column: "",
  task_type: "classification",
  true_y: []
};

export const visionModelExplanationData: Omit<
  IModelExplanationData,
  "predictedY" | "probabilityY"
> = {
  precomputedExplanations: {
    localFeatureImportance: {
      featureNames: [explanation],
      scores: []
    },
    textFeatureImportance: [
      {
        localExplanations: [
          [1, 2, 3],
          [1, 2, 3],
          [1, 2, 3]
        ],
        text: [
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
          "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg"
        ]
      }
    ]
  }
};
