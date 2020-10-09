// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

export interface IParityOption {
  key: string;
  title: string;
  description?: string;
  parityMetric: string;
  parityMode: ParityModes;
}

export enum ParityModes {
  Difference = "difference",
  Ratio = "ratio"
}

export const parityOptions: { [key: string]: IParityOption } = {
  recall_score: {
    description: localization.Metrics.equalOpportunityDifferenceDescription,
    key: "recall_score",
    parityMetric: "recall_score",
    parityMode: ParityModes.Difference,
    title: localization.Metrics.equalOpportunityDifference
  },
  selection_rate: {
    description: localization.Metrics.parityDifferenceDescription,
    key: "selection_rate",
    parityMetric: "selection_rate",
    parityMode: ParityModes.Difference,
    title: localization.Metrics.parityDifference
  },
  selection_rate_ratio: {
    description: localization.Metrics.parityRatioDescription,
    key: "selection_rate_ratio",
    parityMetric: "selection_rate",
    parityMode: ParityModes.Ratio,
    title: localization.Metrics.parityRatio
  },
  zero_one_loss: {
    description: localization.Metrics.errorRateDifferenceDescription,
    key: "zero_one_loss",
    parityMetric: "zero_one_loss",
    parityMode: ParityModes.Difference,
    title: localization.Metrics.errorRateDifference
  }
};
