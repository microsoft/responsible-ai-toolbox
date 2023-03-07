// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export class Metrics {
  public static AccuracyScore = "Accuracy score";
  public static ErrorRate = "Error rate";
  public static SelectionRate = "Selection rate";
  public static FalsePositiveRate = "False positive rate";
  public static FalseNegativeRate = "False negative rate";
  public static F1Score = "F1 score";
  public static MacroF1Score = "Macro F1 score";
  public static MacroPrecisionScore = "Macro precision score";
  public static MacroRecallScore = "Macro recall score";
  public static MeanPrediction = "Mean prediction";
  public static MeanSquaredError = "Mean squared error";
  public static MeanAbsoluteError = "Mean absolute error";
  public static MedianAbsoluteError = "Median absolute error";
  public static R2Score = "R2 score";
  public static MicroF1Score = "Micro F1 score";
  public static MicroPrecisionScore = "Micro precision score";
  public static MicroRecallScore = "Micro recall score";
  public static PrecisionScore = "Precision score";
  public static RecallScore = "Recall score";
  public static SampleSize = "Sample size";
}

export enum CohortSource {
  None = "None",
  TreeMap = "Tree map",
  HeatMap = "Heat map",
  ManuallyCreated = "Manually created",
  Prebuilt = "Prebuilt"
}
