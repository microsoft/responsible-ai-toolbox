// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IVisionExplanationDashboardData } from "@responsible-ai/core-ui";

import { explanation } from "./explanation";

export const visionData: IVisionExplanationDashboardData = {
  classNames: ["Water Tower", "not Water Tower"],
  images: [
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
  ],
  localExplanations: [explanation],
  prediction: [0, 1]
};
