// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum BinaryClassificationMetrics {
  Accuracy = "accuracy",
  Precision = "precision",
  Recall = "recall",
  FalseNegativeRate = "falseNegativeRate",
  FalsePositiveRate = "falsePositiveRate",
  SelectionRate = "selectionRate",
  F1Score = "f1Score"
}

export enum RegressionMetrics {
  MeanSquaredError = "meanSquaredError",
  MeanAbsoluteError = "meanAbsoluteError",
  MeanPrediction = "meanPrediction",
  RSquared = "rSquared"
}

export enum MulticlassClassificationMetrics {
  Accuracy = "accuracy"
}
