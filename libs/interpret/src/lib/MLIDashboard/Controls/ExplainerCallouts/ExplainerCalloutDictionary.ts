import { localization } from "../../../Localization/localization";

export interface IExplainerInfo {
  title: string;
  description: string;
  linkUrl?: string;
}

// The list of known explanations is an enumerated list of python strings that interpret outputs
const shapExplanation: IExplainerInfo = {
  title: localization.ExplanationSummary.shapTitle,
  description: localization.ExplanationSummary.shapDescription,
  linkUrl: "https://github.com/slundberg/shap",
};

const limeExplanation: IExplainerInfo = {
  title: localization.ExplanationSummary.limeTitle,
  description: localization.ExplanationSummary.limeDescription,
  linkUrl: "https://github.com/marcotcr/lime",
};

const mimicExplanation: IExplainerInfo = {
  title: localization.ExplanationSummary.mimicTitle,
  description: localization.ExplanationSummary.mimicDescription,
  linkUrl: "https://christophm.github.io/interpretable-ml-book/global.html",
};

const pfiExplanation: IExplainerInfo = {
  title: localization.ExplanationSummary.pfiTitle,
  description: localization.ExplanationSummary.pfiDescription,
  linkUrl: "https://christophm.github.io/interpretable-ml-book/feature-importance.html",
};

export const ExplainerCalloutDictionary: { [key: string]: IExplainerInfo } = {
  shap_deep: shapExplanation,
  shap_tree: shapExplanation,
  shap_kernel: shapExplanation,
  shap: shapExplanation,
  lime: limeExplanation,
  "mimic.lightgbm": mimicExplanation,
  mimic: mimicExplanation,
  "mimic.sgd": mimicExplanation,
  "mimic.linear": mimicExplanation,
  pfi: pfiExplanation,
};
