// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

export interface IPerformanceOption {
  key: string;
  title: string;
  isMinimization: boolean;
  isPercentage: boolean;
  description?: string;
  tags?: string[];
  userVisible?: boolean;
  alwaysUpperCase?: boolean;
  group: string;
}

export const performanceOptions: { [key: string]: IPerformanceOption } = {
  accuracy_score: {
    description: localization.Fairness.Metrics.accuracyDescription,
    group:
      localization.Fairness.Metrics.Groups.classificationAccuracyAndErrorRate,
    isMinimization: false,
    isPercentage: true,
    key: "accuracy_score",
    title: localization.Fairness.Metrics.accuracyScore,
    userVisible: true
  },
  auc: {
    description: localization.Fairness.Metrics.aucDescription,
    group: localization.Fairness.Metrics.Groups.auc,
    isMinimization: false,
    isPercentage: false,
    key: "auc",
    title: localization.Fairness.Metrics.auc,
    userVisible: true
  },
  average: {
    description: localization.Fairness.loremIpsum,
    group: localization.Fairness.Metrics.Groups.average,
    isMinimization: false,
    isPercentage: false,
    key: "average",
    title: localization.Fairness.Metrics.average
  },
  balanced_accuracy_score: {
    description: localization.Fairness.Metrics.balancedAccuracyDescription,
    group:
      localization.Fairness.Metrics.Groups.classificationAccuracyAndErrorRate,
    isMinimization: false,
    isPercentage: true,
    key: "balanced_accuracy_score",
    title: localization.Fairness.Metrics.balancedAccuracy,
    userVisible: true
  },
  balanced_root_mean_squared_error: {
    description: localization.Fairness.Metrics.balancedRMSEDescription,
    group:
      localization.Fairness.Metrics.Groups.classificationAccuracyAndErrorRate,
    isMinimization: true,
    isPercentage: false,
    key: "balanced_root_mean_squared_error",
    title: localization.Fairness.Metrics.balancedRootMeanSquaredError,
    userVisible: true
  },
  f1_score: {
    alwaysUpperCase: true,
    description: localization.Fairness.Metrics.f1ScoreDescription,
    group: localization.Fairness.Metrics.Groups.f1_score,
    isMinimization: false,
    isPercentage: false,
    key: "f1_score",
    title: localization.Fairness.Metrics.f1Score,
    userVisible: true
  },
  fallout_rate: {
    description: localization.Fairness.Metrics.falsePositiveRateDescription,
    group: localization.Fairness.Metrics.Groups.falsePositiveRate,
    isMinimization: true,
    isPercentage: true,
    key: "fallout_rate",
    title: localization.Fairness.Metrics.falsePositiveRate
  },
  log_loss: {
    description: localization.Fairness.loremIpsum,
    group: localization.Fairness.Metrics.Groups.loss,
    isMinimization: true,
    isPercentage: false,
    key: "log_loss",
    title: localization.Fairness.Metrics.logLoss
  },
  max_error: {
    description: localization.Fairness.loremIpsum,
    group: localization.Fairness.Metrics.Groups.regressionError,
    isMinimization: true,
    isPercentage: false,
    key: "max_error",
    title: localization.Fairness.Metrics.maxError
  },
  mean_absolute_error: {
    description: localization.Fairness.Metrics.meanAbsoluteErrorDescription,
    group: localization.Fairness.Metrics.Groups.regressionError,
    isMinimization: true,
    isPercentage: false,
    key: "mean_absolute_error",
    title: localization.Fairness.Metrics.meanAbsoluteError,
    userVisible: true
  },
  mean_squared_error: {
    description: localization.Fairness.Metrics.mseDescription,
    group: localization.Fairness.Metrics.Groups.regressionError,
    isMinimization: true,
    isPercentage: false,
    key: "mean_squared_error",
    title: localization.Fairness.Metrics.meanSquaredError,
    userVisible: true
  },
  mean_squared_log_error: {
    description: localization.Fairness.loremIpsum,
    group: localization.Fairness.Metrics.Groups.regressionError,
    isMinimization: true,
    isPercentage: false,
    key: "mean_squared_log_error",
    title: localization.Fairness.Metrics.meanSquaredLogError
  },
  median_absolute_error: {
    description: localization.Fairness.loremIpsum,
    group: localization.Fairness.Metrics.Groups.regressionError,
    isMinimization: true,
    isPercentage: false,
    key: "median_absolute_error",
    title: localization.Fairness.Metrics.medianAbsoluteError
  },
  miss_rate: {
    description: localization.Fairness.Metrics.falseNegativeRateDescription,
    group: localization.Fairness.Metrics.Groups.falseNegativeRate,
    isMinimization: true,
    isPercentage: true,
    key: "miss_rate",
    title: localization.Fairness.Metrics.falseNegativeRate
  },
  overprediction: {
    description: localization.Fairness.loremIpsum,
    group: localization.Fairness.Metrics.Groups.overUnderPrediction,
    isMinimization: true,
    isPercentage: false,
    key: "overprediction",
    title: localization.Fairness.Metrics.overprediction
  },
  precision_score: {
    description: localization.Fairness.Metrics.precisionDescription,
    group: localization.Fairness.Metrics.Groups.precision,
    isMinimization: false,
    isPercentage: true,
    key: "precision_score",
    title: localization.Fairness.Metrics.precisionScore,
    userVisible: true
  },
  r2_score: {
    alwaysUpperCase: true,
    description: localization.Fairness.Metrics.r2Description,
    group: localization.Fairness.Metrics.Groups.r2_score,
    isMinimization: false,
    isPercentage: false,
    key: "r2_score",
    title: localization.Fairness.Metrics.r2_score,
    userVisible: true
  },
  recall_score: {
    description: localization.Fairness.Metrics.recallDescription,
    group: localization.Fairness.Metrics.Groups.truePositiveRate,
    isMinimization: false,
    isPercentage: true,
    key: "recall_score",
    title: localization.Fairness.Metrics.recallScore,
    userVisible: true
  },
  root_mean_squared_error: {
    alwaysUpperCase: true,
    description: localization.Fairness.Metrics.rmseDescription,
    group: localization.Fairness.Metrics.Groups.regressionError,
    isMinimization: true,
    isPercentage: false,
    key: "root_mean_squared_error",
    title: localization.Fairness.Metrics.rms_error,
    userVisible: true
  },
  selection_rate: {
    description: localization.Fairness.loremIpsum,
    group: localization.Fairness.Metrics.Groups.selectionRate,
    isMinimization: false,
    isPercentage: true,
    key: "selection_rate",
    title: localization.Fairness.Metrics.selectionRate
  },
  specificity_score: {
    description: localization.Fairness.loremIpsum,
    group: localization.Fairness.Metrics.Groups.trueNegativeRate,
    isMinimization: false,
    isPercentage: true,
    key: "specificity_score",
    title: localization.Fairness.Metrics.specificityScore
  },
  underprediction: {
    description: localization.Fairness.loremIpsum,
    group: localization.Fairness.Metrics.Groups.overUnderPrediction,
    isMinimization: true,
    isPercentage: false,
    key: "underprediction",
    title: localization.Fairness.Metrics.underprediction
  },
  zero_one_loss: {
    description: localization.Fairness.loremIpsum,
    group:
      localization.Fairness.Metrics.Groups.classificationAccuracyAndErrorRate,
    isMinimization: true,
    isPercentage: true,
    key: "zero_one_loss",
    title: localization.Fairness.Metrics.zeroOneLoss
  }
};

// List of fairness metrics to prefer as default if available.
// The purpose of this list is to avoid having less popular metrics
// selected by default.
export const defaultPerformanceMetricPrioritization = [
  // binary classification
  performanceOptions.accuracy_score.key,
  // regression / probability
  performanceOptions.mean_squared_error.key,
  performanceOptions.mean_absolute_error.key,
  performanceOptions.root_mean_squared_error.key
];
