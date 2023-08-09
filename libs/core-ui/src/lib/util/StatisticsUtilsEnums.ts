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
  Accuracy = "accuracy",
  MacroF1 = "f1",
  MacroPrecision = "precision",
  MacroRecall = "recall",
  MicroF1 = "microF1",
  MicroPrecision = "microPrecision",
  MicroRecall = "microRecall"
}
