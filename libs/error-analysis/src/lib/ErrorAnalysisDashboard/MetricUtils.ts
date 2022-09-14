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
  [Metrics.AccuracyScore]: localization.ErrorAnalysis.Metrics.accuracyScore,
  [Metrics.ErrorRate]: localization.ErrorAnalysis.Metrics.errorRate,
  [Metrics.MeanSquaredError]:
    localization.ErrorAnalysis.Metrics.meanSquaredError,
  [Metrics.MeanAbsoluteError]:
    localization.ErrorAnalysis.Metrics.meanAbsoluteError,
  [Metrics.F1Score]: localization.ErrorAnalysis.Metrics.f1Score,
  [Metrics.PrecisionScore]: localization.ErrorAnalysis.Metrics.precision,
  [Metrics.RecallScore]: localization.ErrorAnalysis.Metrics.recall,
  [Metrics.MacroPrecisionScore]:
    localization.ErrorAnalysis.Metrics.macroPrecision,
  [Metrics.MicroPrecisionScore]:
    localization.ErrorAnalysis.Metrics.microPrecision,
  [Metrics.MacroRecallScore]: localization.ErrorAnalysis.Metrics.macroRecall,
  [Metrics.MicroRecallScore]: localization.ErrorAnalysis.Metrics.microRecall,
  [Metrics.MacroF1Score]: localization.ErrorAnalysis.Metrics.macroF1Score,
  [Metrics.MicroF1Score]: localization.ErrorAnalysis.Metrics.microF1Score
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
