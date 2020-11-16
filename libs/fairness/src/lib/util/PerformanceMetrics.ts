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
}

export const performanceOptions: { [key: string]: IPerformanceOption } = {
  accuracy_score: {
    description: localization.Fairness.Metrics.accuracyDescription,
    isMinimization: false,
    isPercentage: true,
    key: "accuracy_score",
    title: localization.Fairness.Metrics.accuracyScore,
    userVisible: true
  },
  auc: {
    description: localization.Fairness.Metrics.aucDescription,
    isMinimization: false,
    isPercentage: false,
    key: "auc",
    title: localization.Fairness.Metrics.auc,
    userVisible: true
  },
  average: {
    description: localization.Fairness.loremIpsum,
    isMinimization: false,
    isPercentage: false,
    key: "average",
    title: localization.Fairness.Metrics.average
  },
  balanced_accuracy_score: {
    description: localization.Fairness.Metrics.balancedAccuracyDescription,
    isMinimization: false,
    isPercentage: true,
    key: "balanced_accuracy_score",
    title: localization.Fairness.Metrics.balancedAccuracy,
    userVisible: true
  },
  balanced_root_mean_squared_error: {
    description: localization.Fairness.Metrics.balancedRMSEDescription,
    isMinimization: true,
    isPercentage: false,
    key: "balanced_root_mean_squared_error",
    title: localization.Fairness.Metrics.balancedRootMeanSquaredError,
    userVisible: true
  },
  f1_score: {
    alwaysUpperCase: true,
    description: localization.Fairness.Metrics.f1ScoreDescription,
    isMinimization: false,
    isPercentage: false,
    key: "f1_score",
    title: localization.Fairness.Metrics.f1Score,
    userVisible: true
  },
  fallout_rate: {
    description: localization.Fairness.loremIpsum,
    isMinimization: true,
    isPercentage: true,
    key: "fallout_rate",
    title: localization.Fairness.Metrics.falloutRate
  },
  false_negative_over_total: {
    description: localization.Fairness.Metrics.falseNegativeRateDescription,
    isMinimization: true,
    isPercentage: true,
    key: "false_negative_over_total",
    title: localization.Fairness.Metrics.falseNegativeRate
  },
  false_positive_over_total: {
    description: localization.Fairness.Metrics.falsePositiveRateDescription,
    isMinimization: true,
    isPercentage: true,
    key: "false_positive_over_total",
    title: localization.Fairness.Metrics.falsePositiveRate
  },
  log_loss: {
    description: localization.Fairness.loremIpsum,
    isMinimization: true,
    isPercentage: false,
    key: "log_loss",
    title: localization.Fairness.Metrics.logLoss
  },
  max_error: {
    description: localization.Fairness.loremIpsum,
    isMinimization: true,
    isPercentage: false,
    key: "max_error",
    title: localization.Fairness.Metrics.maxError
  },
  mean_absolute_error: {
    description: localization.Fairness.Metrics.meanAbsoluteErrorDescription,
    isMinimization: true,
    isPercentage: false,
    key: "mean_absolute_error",
    title: localization.Fairness.Metrics.meanAbsoluteError,
    userVisible: true
  },
  mean_squared_error: {
    description: localization.Fairness.Metrics.mseDescription,
    isMinimization: true,
    isPercentage: false,
    key: "mean_squared_error",
    title: localization.Fairness.Metrics.meanSquaredError,
    userVisible: true
  },
  mean_squared_log_error: {
    description: localization.Fairness.loremIpsum,
    isMinimization: true,
    isPercentage: false,
    key: "mean_squared_log_error",
    title: localization.Fairness.Metrics.meanSquaredLogError
  },
  median_absolute_error: {
    description: localization.Fairness.loremIpsum,
    isMinimization: true,
    isPercentage: false,
    key: "median_absolute_error",
    title: localization.Fairness.Metrics.medianAbsoluteError
  },
  miss_rate: {
    description: localization.Fairness.loremIpsum,
    isMinimization: true,
    isPercentage: true,
    key: "miss_rate",
    title: localization.Fairness.Metrics.missRate
  },
  overprediction: {
    description: localization.Fairness.loremIpsum,
    isMinimization: true,
    isPercentage: false,
    key: "overprediction",
    title: localization.Fairness.Metrics.overprediction
  },
  precision_score: {
    description: localization.Fairness.Metrics.precisionDescription,
    isMinimization: false,
    isPercentage: true,
    key: "precision_score",
    title: localization.Fairness.Metrics.precisionScore,
    userVisible: true
  },
  r2_score: {
    alwaysUpperCase: true,
    description: localization.Fairness.Metrics.r2Description,
    isMinimization: false,
    isPercentage: false,
    key: "r2_score",
    title: localization.Fairness.Metrics.r2_score,
    userVisible: true
  },
  recall_score: {
    description: localization.Fairness.Metrics.recallDescription,
    isMinimization: false,
    isPercentage: true,
    key: "recall_score",
    title: localization.Fairness.Metrics.recallScore,
    userVisible: true
  },
  root_mean_squared_error: {
    alwaysUpperCase: true,
    description: localization.Fairness.Metrics.rmseDescription,
    isMinimization: true,
    isPercentage: false,
    key: "root_mean_squared_error",
    title: localization.Fairness.Metrics.rms_error,
    userVisible: true
  },
  selection_rate: {
    description: localization.Fairness.loremIpsum,
    isMinimization: false,
    isPercentage: true,
    key: "selection_rate",
    title: localization.Fairness.Metrics.selectionRate
  },
  specificity_score: {
    description: localization.Fairness.loremIpsum,
    isMinimization: false,
    isPercentage: true,
    key: "specificity_score",
    title: localization.Fairness.Metrics.specificityScore
  },
  underprediction: {
    description: localization.Fairness.loremIpsum,
    isMinimization: true,
    isPercentage: false,
    key: "underprediction",
    title: localization.Fairness.Metrics.underprediction
  },
  zero_one_loss: {
    description: localization.Fairness.loremIpsum,
    isMinimization: true,
    isPercentage: true,
    key: "zero_one_loss",
    title: localization.Fairness.Metrics.zeroOneLoss
  }
};
