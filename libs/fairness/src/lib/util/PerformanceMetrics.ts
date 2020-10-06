// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "./../Localization/localization";

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
    description: localization.Metrics.accuracyDescription,
    isMinimization: false,
    isPercentage: true,
    key: "accuracy_score",
    title: localization.Metrics.accuracyScore,
    userVisible: true
  },
  auc: {
    description: localization.Metrics.aucDescription,
    isMinimization: false,
    isPercentage: false,
    key: "auc",
    title: localization.Metrics.auc,
    userVisible: true
  },
  average: {
    description: localization.loremIpsum,
    isMinimization: false,
    isPercentage: false,
    key: "average",
    title: localization.Metrics.average
  },
  balanced_accuracy_score: {
    description: localization.Metrics.balancedAccuracyDescription,
    isMinimization: false,
    isPercentage: true,
    key: "balanced_accuracy_score",
    title: localization.Metrics.balancedAccuracy,
    userVisible: true
  },
  balanced_root_mean_squared_error: {
    description: localization.Metrics.balancedRMSEDescription,
    isMinimization: true,
    isPercentage: false,
    key: "balanced_root_mean_squared_error",
    title: localization.Metrics.balancedRootMeanSquaredError,
    userVisible: true
  },
  f1_score: {
    alwaysUpperCase: true,
    description: localization.Metrics.f1ScoreDescription,
    isMinimization: false,
    isPercentage: false,
    key: "f1_score",
    title: localization.Metrics.f1Score,
    userVisible: true
  },
  fallout_rate: {
    description: localization.loremIpsum,
    isMinimization: true,
    isPercentage: true,
    key: "fallout_rate",
    title: localization.Metrics.falloutRate
  },
  false_negative_rate: {
    description: localization.Metrics.falseNegativeRateDescription,
    isMinimization: true,
    isPercentage: true,
    key: "false_negative_rate",
    title: localization.Metrics.falseNegativeRate
  },
  false_positive_rate: {
    description: localization.Metrics.falsePositiveRateDescription,
    isMinimization: true,
    isPercentage: true,
    key: "false_positive_rate",
    title: localization.Metrics.falsePositiveRate
  },
  log_loss: {
    description: localization.loremIpsum,
    isMinimization: true,
    isPercentage: false,
    key: "log_loss",
    title: localization.Metrics.logLoss
  },
  max_error: {
    description: localization.loremIpsum,
    isMinimization: true,
    isPercentage: false,
    key: "max_error",
    title: localization.Metrics.maxError
  },
  mean_absolute_error: {
    description: localization.Metrics.meanAbsoluteErrorDescription,
    isMinimization: true,
    isPercentage: false,
    key: "mean_absolute_error",
    title: localization.Metrics.meanAbsoluteError,
    userVisible: true
  },
  mean_squared_error: {
    description: localization.Metrics.mseDescription,
    isMinimization: true,
    isPercentage: false,
    key: "mean_squared_error",
    title: localization.Metrics.meanSquaredError,
    userVisible: true
  },
  mean_squared_log_error: {
    description: localization.loremIpsum,
    isMinimization: true,
    isPercentage: false,
    key: "mean_squared_log_error",
    title: localization.Metrics.meanSquaredLogError
  },
  median_absolute_error: {
    description: localization.loremIpsum,
    isMinimization: true,
    isPercentage: false,
    key: "median_absolute_error",
    title: localization.Metrics.medianAbsoluteError
  },
  miss_rate: {
    description: localization.loremIpsum,
    isMinimization: true,
    isPercentage: true,
    key: "miss_rate",
    title: localization.Metrics.missRate
  },
  overprediction: {
    description: localization.loremIpsum,
    isMinimization: true,
    isPercentage: false,
    key: "overprediction",
    title: localization.Metrics.overprediction
  },
  precision_score: {
    description: localization.Metrics.precisionDescription,
    isMinimization: false,
    isPercentage: true,
    key: "precision_score",
    title: localization.Metrics.precisionScore,
    userVisible: true
  },
  r2_score: {
    alwaysUpperCase: true,
    description: localization.Metrics.r2Description,
    isMinimization: false,
    isPercentage: false,
    key: "r2_score",
    title: localization.Metrics.r2_score,
    userVisible: true
  },
  recall_score: {
    description: localization.Metrics.recallDescription,
    isMinimization: false,
    isPercentage: true,
    key: "recall_score",
    title: localization.Metrics.recallScore,
    userVisible: true
  },
  root_mean_squared_error: {
    alwaysUpperCase: true,
    description: localization.Metrics.rmseDescription,
    isMinimization: true,
    isPercentage: false,
    key: "root_mean_squared_error",
    title: localization.Metrics.rms_error,
    userVisible: true
  },
  selection_rate: {
    description: localization.loremIpsum,
    isMinimization: false,
    isPercentage: true,
    key: "selection_rate",
    title: localization.Metrics.selectionRate
  },
  specificity_score: {
    description: localization.loremIpsum,
    isMinimization: false,
    isPercentage: true,
    key: "specificity_score",
    title: localization.Metrics.specificityScore
  },
  underprediction: {
    description: localization.loremIpsum,
    isMinimization: true,
    isPercentage: false,
    key: "underprediction",
    title: localization.Metrics.underprediction
  },
  zero_one_loss: {
    description: localization.loremIpsum,
    isMinimization: true,
    isPercentage: true,
    key: "zero_one_loss",
    title: localization.Metrics.zeroOneLoss
  }
};
