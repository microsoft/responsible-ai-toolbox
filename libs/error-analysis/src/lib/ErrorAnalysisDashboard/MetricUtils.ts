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
      case Metrics.PrecisionScore: {
        if (type === MetricLocalizationType.Name) {
          return localization.ErrorAnalysis.Metrics.precision;
        } else if (type === MetricLocalizationType.Info) {
          return localization.ErrorAnalysis.Metrics.precisionInfo;
        } else if (type === MetricLocalizationType.Title) {
          return localization.ErrorAnalysis.Metrics.precisionTitle;
        }
        return localization.ErrorAnalysis.Metrics.precisionShort;
      }
      case Metrics.RecallScore: {
        if (type === MetricLocalizationType.Name) {
          return localization.ErrorAnalysis.Metrics.recall;
        } else if (type === MetricLocalizationType.Info) {
          return localization.ErrorAnalysis.Metrics.recallInfo;
        } else if (type === MetricLocalizationType.Title) {
          return localization.ErrorAnalysis.Metrics.recallTitle;
        }
        return localization.ErrorAnalysis.Metrics.recallShort;
      }
      case Metrics.MacroPrecisionScore: {
        if (type === MetricLocalizationType.Name) {
          return localization.ErrorAnalysis.Metrics.macroPrecision;
        } else if (type === MetricLocalizationType.Info) {
          return localization.ErrorAnalysis.Metrics.macroPrecisionInfo;
        } else if (type === MetricLocalizationType.Title) {
          return localization.ErrorAnalysis.Metrics.macroPrecisionTitle;
        }
        return localization.ErrorAnalysis.Metrics.macroPrecisionShort;
      }
      case Metrics.MicroPrecisionScore: {
        if (type === MetricLocalizationType.Name) {
          return localization.ErrorAnalysis.Metrics.microPrecision;
        } else if (type === MetricLocalizationType.Info) {
          return localization.ErrorAnalysis.Metrics.microPrecisionInfo;
        } else if (type === MetricLocalizationType.Title) {
          return localization.ErrorAnalysis.Metrics.microPrecisionTitle;
        }
        return localization.ErrorAnalysis.Metrics.microPrecisionShort;
      }
      case Metrics.MacroRecallScore: {
        if (type === MetricLocalizationType.Name) {
          return localization.ErrorAnalysis.Metrics.macroRecall;
        } else if (type === MetricLocalizationType.Info) {
          return localization.ErrorAnalysis.Metrics.macroRecallInfo;
        } else if (type === MetricLocalizationType.Title) {
          return localization.ErrorAnalysis.Metrics.macroRecallTitle;
        }
        return localization.ErrorAnalysis.Metrics.macroRecallShort;
      }
      case Metrics.MicroRecallScore: {
        if (type === MetricLocalizationType.Name) {
          return localization.ErrorAnalysis.Metrics.microRecall;
        } else if (type === MetricLocalizationType.Info) {
          return localization.ErrorAnalysis.Metrics.microRecallInfo;
        } else if (type === MetricLocalizationType.Title) {
          return localization.ErrorAnalysis.Metrics.microRecallTitle;
        }
        return localization.ErrorAnalysis.Metrics.microRecallShort;
      }
      default: {
        return "";
      }
    }
  }
}
