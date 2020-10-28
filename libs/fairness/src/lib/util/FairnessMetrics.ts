// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import { PredictionTypes } from "../IFairnessProps";

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
    key: "accuracy_score_difference",
    fairnessMetric: "accuracy_score",
    fairnessMode: FairnessModes.Difference,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.accuracyScoreDifference
  },
  accuracy_score_min: {
    description: localization.Fairness.Metrics.accuracyScoreMinDescription,
    key: "accuracy_score_min",
    fairnessMetric: "accuracy_score",
    fairnessMode: FairnessModes.Min,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.accuracyScoreMin
  },
  accuracy_score_ratio: {
    description: localization.Fairness.Metrics.accuracyScoreRatioDescription,
    key: "accuracy_score_ratio",
    fairnessMetric: "accuracy_score",
    fairnessMode: FairnessModes.Ratio,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.accuracyScoreRatio
  },
  balanced_accuracy_score_min: {
    description:
      localization.Fairness.Metrics.balancedAccuracyScoreMinDescription,
    key: "balanced_accuracy_score_min",
    fairnessMetric: "balanced_accuracy_score",
    fairnessMode: FairnessModes.Min,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.balancedAccuracyScoreMin
  },
  demographic_parity_difference: {
    description:
      localization.Fairness.Metrics.demographicParityDifferenceDescription,
    key: "demographic_parity_difference",
    fairnessMetric: "selection_rate",
    fairnessMode: FairnessModes.Difference,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.demographicParityDifference
  },
  demographic_parity_ratio: {
    description:
      localization.Fairness.Metrics.demographicParityRatioDescription,
    key: "demographic_parity_ratio",
    fairnessMetric: "selection_rate",
    fairnessMode: FairnessModes.Ratio,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.demographicParityRatio
  },
  equalized_odds_difference: {
    description:
      localization.Fairness.Metrics.equalizedOddsDifferenceDescription,
    key: "equalized_odds_difference",
    fairnessMetric: "", // combination of two metrics
    fairnessMode: FairnessModes.Difference,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.equalizedOddsDifference
  },
  equalized_odds_ratio: {
    description: localization.Fairness.Metrics.equalizedOddsRatioDescription,
    key: "equalized_odds_ratio",
    fairnessMetric: "", // combination of two metrics
    fairnessMode: FairnessModes.Ratio,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.equalizedOddsRatio
  },
  // zero_one_loss is the error rate for binary classification, while
  // mean_absolute_error is the error rate for probabilistic classification and regression
  error_rate_difference: {
    description: localization.Fairness.Metrics.errorRateDifferenceDescription,
    key: "error_rate_difference",
    fairnessMetric: "zero_one_loss",
    fairnessMode: FairnessModes.Difference,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.errorRateDifference
  },
  error_rate_ratio: {
    description: localization.Fairness.Metrics.errorRateRatioDescription,
    key: "error_rate_ratio",
    fairnessMetric: "zero_one_loss",
    fairnessMode: FairnessModes.Ratio,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.errorRateRatio
  },
  f1_score_min: {
    description: localization.Fairness.Metrics.f1ScoreMinDescription,
    key: "f1_score_min",
    fairnessMetric: "f1_score",
    fairnessMode: FairnessModes.Min,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.f1ScoreMin
  },
  false_negative_rate_difference: {
    description:
      localization.Fairness.Metrics.falseNegativeRateDifferenceDescription,
    key: "false_negative_rate_difference",
    fairnessMetric: "false_negative_over_total",
    fairnessMode: FairnessModes.Difference,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.falseNegativeRateDifference
  },
  false_negative_rate_ratio: {
    description:
      localization.Fairness.Metrics.falseNegativeRateDifferenceDescription,
    key: "false_negative_rate_ratio",
    fairnessMetric: "false_negative_over_total",
    fairnessMode: FairnessModes.Ratio,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.falseNegativeRateRatio
  },
  false_positive_rate_difference: {
    description:
      localization.Fairness.Metrics.falsePositiveRateDifferenceDescription,
    key: "false_positive_rate_difference",
    fairnessMetric: "false_positive_over_total",
    fairnessMode: FairnessModes.Difference,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.falsePositiveRateDifference
  },
  false_positive_rate_ratio: {
    description:
      localization.Fairness.Metrics.falsePositiveRateDifferenceDescription,
    key: "false_positive_rate_ratio",
    fairnessMetric: "false_positive_over_total",
    fairnessMode: FairnessModes.Ratio,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.falsePositiveRateRatio
  },
  log_loss_max: {
    description: localization.Fairness.Metrics.logLossMaxDescription,
    key: "log_loss_max",
    fairnessMetric: "log_loss",
    fairnessMode: FairnessModes.Max,
    supportedTasks: new Set([PredictionTypes.Probability]),
    title: localization.Fairness.Metrics.logLossMax
  },
  mean_absolute_error_max: {
    description: localization.Fairness.Metrics.meanAbsoluteErrorMaxDescription,
    key: "mean_absolute_error_max",
    fairnessMetric: "mean_absolute_error",
    fairnessMode: FairnessModes.Max,
    supportedTasks: new Set([PredictionTypes.Regression]),
    title: localization.Fairness.Metrics.meanAbsoluteErrorMax
  },
  mean_squared_error_max: {
    description: localization.Fairness.Metrics.meanSquaredErrorMaxDescription,
    key: "mean_squared_error_max",
    fairnessMetric: "mean_squared_error",
    fairnessMode: FairnessModes.Max,
    supportedTasks: new Set([
      PredictionTypes.Regression,
      PredictionTypes.Probability
    ]),
    title: localization.Fairness.Metrics.meanSquaredErrorMax
  },
  precision_score_min: {
    description: localization.Fairness.Metrics.precisionScoreMinDescription,
    key: "precision_score_min",
    fairnessMetric: "precision_score",
    fairnessMode: FairnessModes.Min,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.precisionScoreMin
  },
  r2_score_min: {
    description: localization.Fairness.Metrics.r2ScoreMinDescription,
    key: "r2_score_min",
    fairnessMetric: "r2_score",
    fairnessMode: FairnessModes.Min,
    supportedTasks: new Set([PredictionTypes.Regression]),
    title: localization.Fairness.Metrics.r2ScoreMin
  },
  recall_score_min: {
    description: localization.Fairness.Metrics.recallScoreMinDescription,
    key: "recall_score_min",
    fairnessMetric: "recall_score",
    fairnessMode: FairnessModes.Min,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.recallScoreMin
  },
  roc_auc_score_min: {
    description: localization.Fairness.Metrics.ROCAUCScoreMinDescription,
    key: "roc_auc_score_min",
    fairnessMetric: "roc_auc_score",
    fairnessMode: FairnessModes.Min,
    supportedTasks: new Set([PredictionTypes.Probability]),
    title: localization.Fairness.Metrics.ROCAUCScoreMin
  },
  true_negative_rate_difference: {
    description:
      localization.Fairness.Metrics.trueNegativeRateDifferenceDescription,
    key: "true_negative_rate_difference",
    fairnessMetric: "recall_score",
    fairnessMode: FairnessModes.Difference,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.trueNegativeRateDifference
  },
  true_negative_rate_ratio: {
    description:
      localization.Fairness.Metrics.trueNegativeRateDifferenceDescription,
    key: "true_negative_rate_ratio",
    fairnessMetric: "recall_score",
    fairnessMode: FairnessModes.Ratio,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.trueNegativeRateRatio
  },
  true_positive_rate_difference: {
    description:
      localization.Fairness.Metrics.truePositiveRateDifferenceDescription,
    key: "true_positive_rate_difference",
    fairnessMetric: "recall_score",
    fairnessMode: FairnessModes.Difference,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.truePositiveRateDifference
  },
  true_positive_rate_ratio: {
    description:
      localization.Fairness.Metrics.truePositiveRateDifferenceDescription,
    key: "true_positive_rate_ratio",
    fairnessMetric: "recall_score",
    fairnessMode: FairnessModes.Ratio,
    supportedTasks: new Set([PredictionTypes.BinaryClassification]),
    title: localization.Fairness.Metrics.truePositiveRateRatio
  }
};
