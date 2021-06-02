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

export class MetricUtils {
  public static getLocalizedMetric(
    metricName: string,
    type: MetricLocalizationType
  ): string {
    switch (metricName) {
      case Metrics.ErrorRate: {
        if (
          type === MetricLocalizationType.Name ||
          type === MetricLocalizationType.Short
        ) {
          return localization.ErrorAnalysis.Metrics.errorRate;
        } else if (type === MetricLocalizationType.Info) {
          return localization.ErrorAnalysis.Metrics.errorRateInfo;
        }
        return localization.ErrorAnalysis.Metrics.errorRateTitle;
      }
      case Metrics.MeanSquaredError: {
        if (type === MetricLocalizationType.Name) {
          return localization.ErrorAnalysis.Metrics.meanSquaredError;
        } else if (type === MetricLocalizationType.Info) {
          return localization.ErrorAnalysis.Metrics.meanSquaredErrorInfo;
        } else if (type === MetricLocalizationType.Title) {
          return localization.ErrorAnalysis.Metrics.meanSquaredErrorTitle;
        }
        return localization.ErrorAnalysis.Metrics.meanSquaredErrorShort;
      }
      case Metrics.MeanAbsoluteError: {
        if (type === MetricLocalizationType.Name) {
          return localization.ErrorAnalysis.Metrics.meanAbsoluteError;
        } else if (type === MetricLocalizationType.Info) {
          return localization.ErrorAnalysis.Metrics.meanAbsoluteErrorInfo;
        } else if (type === MetricLocalizationType.Title) {
          return localization.ErrorAnalysis.Metrics.meanAbsoluteErrorTitle;
        }
        return localization.ErrorAnalysis.Metrics.meanAbsoluteErrorShort;
      }
      default: {
        return "";
      }
    }
  }
}
