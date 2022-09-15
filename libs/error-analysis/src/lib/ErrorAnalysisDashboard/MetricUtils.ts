// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Metrics } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export enum MetricLocalizationType {
  Name = 1,
  Info,
  Title,
  Short
}

const localizedMetricMapping = {
  [Metrics.AccuracyScore]: localization.ErrorAnalysis.Metrics.AccuracyScore,
  [Metrics.ErrorRate]: localization.ErrorAnalysis.Metrics.ErrorRate,
  [Metrics.MeanSquaredError]:
    localization.ErrorAnalysis.Metrics.MeanSquaredError,
  [Metrics.MeanAbsoluteError]:
    localization.ErrorAnalysis.Metrics.MeanAbsoluteError,
  [Metrics.F1Score]: localization.ErrorAnalysis.Metrics.F1Score,
  [Metrics.PrecisionScore]: localization.ErrorAnalysis.Metrics.Precision,
  [Metrics.RecallScore]: localization.ErrorAnalysis.Metrics.Recall,
  [Metrics.MacroPrecisionScore]:
    localization.ErrorAnalysis.Metrics.MacroPrecision,
  [Metrics.MicroPrecisionScore]:
    localization.ErrorAnalysis.Metrics.MicroPrecision,
  [Metrics.MacroRecallScore]: localization.ErrorAnalysis.Metrics.MacroRecall,
  [Metrics.MicroRecallScore]: localization.ErrorAnalysis.Metrics.MicroRecall,
  [Metrics.MacroF1Score]: localization.ErrorAnalysis.Metrics.MacroF1Score,
  [Metrics.MicroF1Score]: localization.ErrorAnalysis.Metrics.MicroF1Score
};

export class MetricUtils {
  public static isErrorMetricName(metricName: string): boolean {
    return (
      metricName === Metrics.ErrorRate ||
      metricName === Metrics.MeanSquaredError ||
      metricName === Metrics.MeanAbsoluteError
    );
  }

  public static getLocalizedMetric(
    metricName: string,
    type: MetricLocalizationType
  ): string {
    const desc = localizedMetricMapping[metricName];
    if (!desc) {
      return "";
    }
    switch (type) {
      case MetricLocalizationType.Info:
        return desc.Info;
      case MetricLocalizationType.Title:
        return desc.Title;
      case MetricLocalizationType.Name:
        return desc.Name;
      case MetricLocalizationType.Short:
        return desc.Short;
      default:
        return "";
    }
  }
}
