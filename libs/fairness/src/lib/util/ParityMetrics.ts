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
  Ratio = "ratio",
  Min = "min",
  Max = "max"
}

export const parityOptions: { [key: string]: IParityOption } = {
  accuracy_score_difference: {
    description:
      localization.Fairness.Metrics.accuracyScoreDifferenceDescription,
    key: "accuracy_score_difference",
    parityMetric: "accuracy_score",
    parityMode: ParityModes.Difference,
    title: localization.Fairness.Metrics.accuracyScoreDifference
  },
  accuracy_score_min: {
    description: localization.Fairness.Metrics.accuracyScoreMinDescription,
    key: "accuracy_score_min",
    parityMetric: "accuracy_score",
    parityMode: ParityModes.Min,
    title: localization.Fairness.Metrics.accuracyScoreMin
  },
  accuracy_score_ratio: {
    description: localization.Fairness.Metrics.accuracyScoreRatioDescription,
    key: "accuracy_score_ratio",
    parityMetric: "accuracy_score",
    parityMode: ParityModes.Ratio,
    title: localization.Fairness.Metrics.accuracyScoreRatio
  },
  balanced_accuracy_score_min: {
    description:
      localization.Fairness.Metrics.balancedAccuracyScoreMinDescription,
    key: "balanced_accuracy_score_min",
    parityMetric: "balanced_accuracy_score",
    parityMode: ParityModes.Min,
    title: localization.Fairness.Metrics.balancedAccuracyScoreMin
  },
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
  equalized_odds_difference: {
    description:
      localization.Fairness.Metrics.equalizedOddsDifferenceDescription,
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
  f1_score_min: {
    description: localization.Fairness.Metrics.f1ScoreMinDescription,
    key: "f1_score_min",
    parityMetric: "f1_score",
    parityMode: ParityModes.Min,
    title: localization.Fairness.Metrics.f1ScoreMin
  },
  false_negative_rate_difference: {
    description:
      localization.Fairness.Metrics.falseNegativeRateDifferenceDescription,
    key: "false_negative_rate_difference",
    parityMetric: "false_negative_over_total",
    parityMode: ParityModes.Difference,
    title: localization.Fairness.Metrics.falseNegativeRateDifference
  },
  false_negative_rate_ratio: {
    description:
      localization.Fairness.Metrics.falseNegativeRateDifferenceDescription,
    key: "false_negative_rate_ratio",
    parityMetric: "false_negative_over_total",
    parityMode: ParityModes.Ratio,
    title: localization.Fairness.Metrics.falseNegativeRateRatio
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
  log_loss_max: {
    description: localization.Fairness.Metrics.logLossMaxDescription,
    key: "log_loss_max",
    parityMetric: "log_loss",
    parityMode: ParityModes.Max,
    title: localization.Fairness.Metrics.logLossMax
  },
  mean_absolute_error_max: {
    description: localization.Fairness.Metrics.meanAbsoluteErrorMaxDescription,
    key: "mean_absolute_error_max",
    parityMetric: "mean_absolute_error",
    parityMode: ParityModes.Max,
    title: localization.Fairness.Metrics.meanAbsoluteErrorMax
  },
  mean_squared_error_max: {
    description: localization.Fairness.Metrics.meanSquaredErrorMaxDescription,
    key: "mean_squared_error_max",
    parityMetric: "mean_squared_error",
    parityMode: ParityModes.Max,
    title: localization.Fairness.Metrics.meanSquaredErrorMax
  },
  precision_score_min: {
    description: localization.Fairness.Metrics.precisionScoreMinDescription,
    key: "precision_score_min",
    parityMetric: "precision_score",
    parityMode: ParityModes.Min,
    title: localization.Fairness.Metrics.precisionScoreMin
  },
  r2_score_min: {
    description: localization.Fairness.Metrics.r2ScoreMinDescription,
    key: "r2_score_min",
    parityMetric: "r2_score",
    parityMode: ParityModes.Min,
    title: localization.Fairness.Metrics.r2ScoreMin
  },
  recall_score_min: {
    description: localization.Fairness.Metrics.recallScoreMinDescription,
    key: "recall_score_min",
    parityMetric: "recall_score",
    parityMode: ParityModes.Min,
    title: localization.Fairness.Metrics.recallScoreMin
  },
  roc_auc_score_min: {
    description: localization.Fairness.Metrics.ROCAUCScoreMinDescription,
    key: "roc_auc_score_min",
    parityMetric: "roc_auc_score",
    parityMode: ParityModes.Min,
    title: localization.Fairness.Metrics.ROCAUCScoreMin
  },
  true_negative_rate_difference: {
    description:
      localization.Fairness.Metrics.trueNegativeRateDifferenceDescription,
    key: "true_negative_rate_difference",
    parityMetric: "recall_score",
    parityMode: ParityModes.Difference,
    title: localization.Fairness.Metrics.trueNegativeRateDifference
  },
  true_negative_rate_ratio: {
    description:
      localization.Fairness.Metrics.trueNegativeRateDifferenceDescription,
    key: "true_negative_rate_ratio",
    parityMetric: "recall_score",
    parityMode: ParityModes.Ratio,
    title: localization.Fairness.Metrics.trueNegativeRateRatio
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
  }
};
