// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PredictionTypes } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export interface IFairnessOption {
  key: string;
  title: string;
  description?: string;
  fairnessMetric: string;
  fairnessMode: FairnessModes;
  supportedTasks: Set<PredictionTypes>;
}

export enum FairnessModes {
  Difference = "difference",
  Ratio = "ratio",
  Min = "min",
  Max = "max"
}

export const fairnessOptions: { [key: string]: IFairnessOption } = {
  accuracy_score_difference: {
    description:
      localization.Fairness.Metrics.accuracyScoreDifferenceDescription,
    fairnessMetric: "accuracy_score",
    fairnessMode: FairnessModes.Difference,
    key: "accuracy_score_difference",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.accuracyScoreDifference
  },
  accuracy_score_min: {
    description: localization.Fairness.Metrics.accuracyScoreMinDescription,
    fairnessMetric: "accuracy_score",
    fairnessMode: FairnessModes.Min,
    key: "accuracy_score_min",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.accuracyScoreMin
  },
  accuracy_score_ratio: {
    description: localization.Fairness.Metrics.accuracyScoreRatioDescription,
    fairnessMetric: "accuracy_score",
    fairnessMode: FairnessModes.Ratio,
    key: "accuracy_score_ratio",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.accuracyScoreRatio
  },
  balanced_accuracy_score_min: {
    description:
      localization.Fairness.Metrics.balancedAccuracyScoreMinDescription,
    fairnessMetric: "balanced_accuracy_score",
    fairnessMode: FairnessModes.Min,
    key: "balanced_accuracy_score_min",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.balancedAccuracyScoreMin
  },
  demographic_parity_difference: {
    description:
      localization.Fairness.Metrics.demographicParityDifferenceDescription,
    fairnessMetric: "selection_rate",
    fairnessMode: FairnessModes.Difference,
    key: "demographic_parity_difference",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.demographicParityDifference
  },
  demographic_parity_ratio: {
    description:
      localization.Fairness.Metrics.demographicParityRatioDescription,
    fairnessMetric: "selection_rate",
    fairnessMode: FairnessModes.Ratio,
    key: "demographic_parity_ratio",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.demographicParityRatio
  },
  equalized_odds_difference: {
    description:
      localization.Fairness.Metrics.equalizedOddsDifferenceDescription,
    fairnessMetric: "",
    // combination of two metrics
    fairnessMode: FairnessModes.Difference,
    key: "equalized_odds_difference",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.equalizedOddsDifference
  },
  equalized_odds_ratio: {
    description: localization.Fairness.Metrics.equalizedOddsRatioDescription,
    fairnessMetric: "",
    // combination of two metrics
    fairnessMode: FairnessModes.Ratio,
    key: "equalized_odds_ratio",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.equalizedOddsRatio
  },
  // zero_one_loss is the error rate for binary classification, while
  // mean_absolute_error is the error rate for probabilistic classification and regression
  error_rate_difference: {
    description: localization.Fairness.Metrics.errorRateDifferenceDescription,
    fairnessMetric: "zero_one_loss",
    fairnessMode: FairnessModes.Difference,
    key: "error_rate_difference",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.errorRateDifference
  },
  error_rate_ratio: {
    description: localization.Fairness.Metrics.errorRateRatioDescription,
    fairnessMetric: "zero_one_loss",
    fairnessMode: FairnessModes.Ratio,
    key: "error_rate_ratio",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.errorRateRatio
  },
  f1_score_min: {
    description: localization.Fairness.Metrics.f1ScoreMinDescription,
    fairnessMetric: "f1_score",
    fairnessMode: FairnessModes.Min,
    key: "f1_score_min",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.f1ScoreMin
  },
  false_negative_rate_difference: {
    description:
      localization.Fairness.Metrics.falseNegativeRateDifferenceDescription,
    fairnessMetric: "miss_rate",
    fairnessMode: FairnessModes.Difference,
    key: "false_negative_rate_difference",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.falseNegativeRateDifference
  },
  false_negative_rate_ratio: {
    description:
      localization.Fairness.Metrics.falseNegativeRateDifferenceDescription,
    fairnessMetric: "miss_rate",
    fairnessMode: FairnessModes.Ratio,
    key: "false_negative_rate_ratio",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.falseNegativeRateRatio
  },
  false_positive_rate_difference: {
    description:
      localization.Fairness.Metrics.falsePositiveRateDifferenceDescription,
    fairnessMetric: "fallout_rate",
    fairnessMode: FairnessModes.Difference,
    key: "false_positive_rate_difference",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.falsePositiveRateDifference
  },
  false_positive_rate_ratio: {
    description:
      localization.Fairness.Metrics.falsePositiveRateDifferenceDescription,
    fairnessMetric: "fallout_rate",
    fairnessMode: FairnessModes.Ratio,
    key: "false_positive_rate_ratio",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.falsePositiveRateRatio
  },
  log_loss_max: {
    description: localization.Fairness.Metrics.logLossMaxDescription,
    fairnessMetric: "log_loss",
    fairnessMode: FairnessModes.Max,
    key: "log_loss_max",
    supportedTasks: new Set([PredictionTypes.Probability]),
    title: localization.Fairness.Metrics.logLossMax
  },
  mean_absolute_error_max: {
    description: localization.Fairness.Metrics.meanAbsoluteErrorMaxDescription,
    fairnessMetric: "mean_absolute_error",
    fairnessMode: FairnessModes.Max,
    key: "mean_absolute_error_max",
    supportedTasks: new Set([PredictionTypes.Regression]),
    title: localization.Fairness.Metrics.meanAbsoluteErrorMax
  },
  mean_squared_error_max: {
    description: localization.Fairness.Metrics.meanSquaredErrorMaxDescription,
    fairnessMetric: "mean_squared_error",
    fairnessMode: FairnessModes.Max,
    key: "mean_squared_error_max",
    supportedTasks: new Set([
      PredictionTypes.Regression,
      PredictionTypes.Probability
    ]),
    title: localization.Fairness.Metrics.meanSquaredErrorMax
  },
  precision_score_min: {
    description: localization.Fairness.Metrics.precisionScoreMinDescription,
    fairnessMetric: "precision_score",
    fairnessMode: FairnessModes.Min,
    key: "precision_score_min",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.precisionScoreMin
  },
  r2_score_min: {
    description: localization.Fairness.Metrics.r2ScoreMinDescription,
    fairnessMetric: "r2_score",
    fairnessMode: FairnessModes.Min,
    key: "r2_score_min",
    supportedTasks: new Set([PredictionTypes.Regression]),
    title: localization.Fairness.Metrics.r2ScoreMin
  },
  recall_score_min: {
    description: localization.Fairness.Metrics.recallScoreMinDescription,
    fairnessMetric: "recall_score",
    fairnessMode: FairnessModes.Min,
    key: "recall_score_min",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.recallScoreMin
  },
  roc_auc_score_min: {
    description: localization.Fairness.Metrics.ROCAUCScoreMinDescription,
    fairnessMetric: "auc",
    fairnessMode: FairnessModes.Min,
    key: "roc_auc_score_min",
    supportedTasks: new Set([PredictionTypes.Probability]),
    title: localization.Fairness.Metrics.ROCAUCScoreMin
  },
  true_negative_rate_difference: {
    description:
      localization.Fairness.Metrics.trueNegativeRateDifferenceDescription,
    fairnessMetric: "specificity_score",
    fairnessMode: FairnessModes.Difference,
    key: "true_negative_rate_difference",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.trueNegativeRateDifference
  },
  true_negative_rate_ratio: {
    description:
      localization.Fairness.Metrics.trueNegativeRateDifferenceDescription,
    fairnessMetric: "specificity_score",
    fairnessMode: FairnessModes.Ratio,
    key: "true_negative_rate_ratio",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.trueNegativeRateRatio
  },
  true_positive_rate_difference: {
    description:
      localization.Fairness.Metrics.truePositiveRateDifferenceDescription,
    fairnessMetric: "recall_score",
    fairnessMode: FairnessModes.Difference,
    key: "true_positive_rate_difference",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.truePositiveRateDifference
  },
  true_positive_rate_ratio: {
    description:
      localization.Fairness.Metrics.truePositiveRateDifferenceDescription,
    fairnessMetric: "recall_score",
    fairnessMode: FairnessModes.Ratio,
    key: "true_positive_rate_ratio",
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.truePositiveRateRatio
  }
};

// List of fairness metrics to prefer as default if available.
// The purpose of this list is to avoid having less popular metrics
// selected by default.
export const defaultFairnessMetricPrioritization = [
  // binary classification
  fairnessOptions.demographic_parity_difference.key,
  fairnessOptions.accuracy_score_difference.key,
  fairnessOptions.equalized_odds_difference.key,
  // regression / probability
  fairnessOptions.mean_absolute_error_max.key,
  fairnessOptions.mean_squared_error_max.key
];
