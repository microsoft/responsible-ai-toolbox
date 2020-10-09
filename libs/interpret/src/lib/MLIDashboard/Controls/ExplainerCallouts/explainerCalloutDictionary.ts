// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

export interface IExplainerInfo {
  title: string;
  description: string;
  linkUrl?: string;
}

// The list of known explanations is an enumerated list of python strings that interpret outputs
const shapExplanation: IExplainerInfo = {
  description: localization.ExplanationSummary.shapDescription,
  linkUrl: "https://github.com/slundberg/shap",
  title: localization.ExplanationSummary.shapTitle
};

const limeExplanation: IExplainerInfo = {
  description: localization.ExplanationSummary.limeDescription,
  linkUrl: "https://github.com/marcotcr/lime",
  title: localization.ExplanationSummary.limeTitle
};

const mimicExplanation: IExplainerInfo = {
  description: localization.ExplanationSummary.mimicDescription,
  linkUrl: "https://christophm.github.io/interpretable-ml-book/global.html",
  title: localization.ExplanationSummary.mimicTitle
};

const pfiExplanation: IExplainerInfo = {
  description: localization.ExplanationSummary.pfiDescription,
  linkUrl:
    "https://christophm.github.io/interpretable-ml-book/feature-importance.html",
  title: localization.ExplanationSummary.pfiTitle
};

export const explainerCalloutDictionary: { [key: string]: IExplainerInfo } = {
  lime: limeExplanation,
  mimic: mimicExplanation,
  "mimic.lightgbm": mimicExplanation,
  "mimic.linear": mimicExplanation,
  "mimic.sgd": mimicExplanation,
  pfi: pfiExplanation,
  shap: shapExplanation,
  shap_deep: shapExplanation,
  shap_kernel: shapExplanation,
  shap_tree: shapExplanation
};
