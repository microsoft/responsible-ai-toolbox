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
  demographic_parity_difference: {
    description:
      localization.Fairness.Metrics.demographicParityDifferenceDescription,
    key: "demographic_parity_difference",
    parityMetric: "selection_rate",
    parityMode: ParityModes.Difference,
    title: localization.Fairness.Metrics.demographicParityDifference
  },
  demographic_parity_ratio: {
    description:
      localization.Fairness.Metrics.demographicParityRatioDescription,
    key: "demographic_parity_ratio",
    parityMetric: "selection_rate",
    parityMode: ParityModes.Ratio,
    title: localization.Fairness.Metrics.demographicParityRatio
  },
  // zero_one_loss is the error rate for binary classification, while
  // mean_absolute_error is the error rate for probabilistic classification and regression
  error_rate_difference_binary_classification: {
    description: localization.Fairness.Metrics.errorRateDifferenceDescription,
    key: "error_rate_difference_binary_classification",
    parityMetric: "zero_one_loss",
    parityMode: ParityModes.Difference,
    title: localization.Fairness.Metrics.errorRateDifference
  },
  error_rate_difference_regression: {
    description: localization.Fairness.Metrics.errorRateDifferenceDescription,
    key: "error_rate_difference_regression",
    parityMetric: "mean_absolute_error",
    parityMode: ParityModes.Difference,
    title: localization.Fairness.Metrics.errorRateDifference
  },
  error_rate_ratio_binary_classification: {
    description: localization.Fairness.Metrics.errorRateRatioDescription,
    key: "error_rate_ratio_binary_classification",
    parityMetric: "zero_one_loss",
    parityMode: ParityModes.Ratio,
    title: localization.Fairness.Metrics.errorRateRatio
  },
  error_rate_ratio_regression: {
    description: localization.Fairness.Metrics.errorRateRatioDescription,
    key: "error_rate_ratio_regression",
    parityMetric: "mean_absolute_error",
    parityMode: ParityModes.Ratio,
    title: localization.Fairness.Metrics.errorRateRatio
  },
  true_positive_rate_difference: {
    description:
      localization.Fairness.Metrics.truePositiveRateDifferenceDescription,
    key: "true_positive_rate_difference",
    parityMetric: "recall_score",
    parityMode: ParityModes.Difference,
    title: localization.Fairness.Metrics.truePositiveRateDifference
  },
  true_positive_rate_ratio: {
    description:
      localization.Fairness.Metrics.truePositiveRateDifferenceDescription,
    key: "true_positive_rate_ratio",
    parityMetric: "recall_score",
    parityMode: ParityModes.Ratio,
    title: localization.Fairness.Metrics.truePositiveRateRatio
  },
  false_positive_rate_difference: {
    description:
      localization.Fairness.Metrics.falsePositiveRateDifferenceDescription,
    key: "false_positive_rate_difference",
    parityMetric: "false_positive_over_total",
    parityMode: ParityModes.Difference,
    title: localization.Fairness.Metrics.falsePositiveRateDifference
  },
  false_positive_rate_ratio: {
    description:
      localization.Fairness.Metrics.falsePositiveRateDifferenceDescription,
    key: "false_positive_rate_ratio",
    parityMetric: "false_positive_over_total",
    parityMode: ParityModes.Ratio,
    title: localization.Fairness.Metrics.falsePositiveRateRatio
  },
  equalized_odds_difference: {
    description: localization.Fairness.Metrics.equalizedOddsDifferenceDescription,
    key: "equalized_odds_difference",
    parityMetric: "", // combination of two metrics
    parityMode: ParityModes.Difference,
    title: localization.Fairness.Metrics.equalizedOddsDifference
  },
  equalized_odds_ratio: {
    description: localization.Fairness.Metrics.equalizedOddsRatioDescription,
    key: "equalized_odds_ratio",
    parityMetric: "", // combination of two metrics
    parityMode: ParityModes.Ratio,
    title: localization.Fairness.Metrics.equalizedOddsRatio
  }
};
