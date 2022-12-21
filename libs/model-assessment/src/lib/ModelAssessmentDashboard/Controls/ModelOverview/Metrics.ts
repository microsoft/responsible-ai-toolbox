// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  ErrorCohort,
  ModelTypes,
  IModelAssessmentContext,
  ILabeledStatistic,
  Metrics,
  generateMetrics,
  JointDataset,
  BinaryClassificationMetrics,
  MulticlassClassificationMetrics,
  RegressionMetrics,
  TotalCohortSamples,
  ifEnableLargeData
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export async function generateMetricsCohortsSDK(
  context: IModelAssessmentContext,
  errorCohorts: ErrorCohort[]
): Promise<ILabeledStatistic[][]> {
  const allMetrics = [];
  if (context.requestMetrics) {
    for (const errorCohort of errorCohorts) {
      const filtersRelabeled = Cohort.getLabeledFilters(
        errorCohort.cohort.filters,
        errorCohort.jointDataset
      );
      const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
        errorCohort.cohort.compositeFilters,
        errorCohort.jointDataset
      );

      const metricResultDict = await context.requestMetrics(
        filtersRelabeled,
        compositeFiltersRelabeled,
        context.modelMetadata.modelType,
        new AbortController().signal
      );

      if (context.modelMetadata.modelType === ModelTypes.Binary) {
        allMetrics.push(convertBinaryClassificationMetrics(metricResultDict));
      } else if (context.modelMetadata.modelType === ModelTypes.Regression) {
        allMetrics.push(convertRegressionMetrics(metricResultDict));
      } else {
        allMetrics.push(
          convertMultiClassClassificationMetrics(metricResultDict)
        );
      }
    }
  }
  return allMetrics;
}

export function convertBinaryClassificationMetrics(
  metricResultDict: Map<string, number>
): ILabeledStatistic[] {
  const allMetricsOutput = [];
  for (const [metric, stat] of Object.entries(metricResultDict)) {
    switch (metric) {
      case Metrics.SampleSize:
        allMetricsOutput.push({
          key: TotalCohortSamples,
          label: localization.Interpret.Statistics.samples,
          stat
        });
        break;
      case Metrics.AccuracyScore:
        allMetricsOutput.push({
          key: BinaryClassificationMetrics.Accuracy,
          label: localization.Interpret.Statistics.accuracy,
          stat
        });
        break;
      case Metrics.F1Score:
        allMetricsOutput.push({
          key: BinaryClassificationMetrics.F1Score,
          label: localization.Interpret.Statistics.f1Score,
          stat
        });
        break;
      case Metrics.RecallScore:
        allMetricsOutput.push({
          key: BinaryClassificationMetrics.Recall,
          label: localization.Interpret.Statistics.recall,
          stat
        });
        break;
      case Metrics.PrecisionScore:
        allMetricsOutput.push({
          key: BinaryClassificationMetrics.Precision,
          label: localization.Interpret.Statistics.precision,
          stat
        });
        break;
      case Metrics.FalseNegativeRate:
        allMetricsOutput.push({
          key: BinaryClassificationMetrics.FalseNegativeRate,
          label: localization.Interpret.Statistics.fnr,
          stat
        });
        break;
      case Metrics.FalsePositiveRate:
        allMetricsOutput.push({
          key: BinaryClassificationMetrics.FalsePositiveRate,
          label: localization.Interpret.Statistics.fpr,
          stat
        });
        break;
      case Metrics.SelectionRate:
        allMetricsOutput.push({
          key: BinaryClassificationMetrics.SelectionRate,
          label: localization.Interpret.Statistics.selectionRate,
          stat
        });
        break;
      default:
        break;
    }
  }
  return allMetricsOutput;
}

export function convertMultiClassClassificationMetrics(
  metricResultDict: Map<string, number>
): ILabeledStatistic[] {
  const allMetricsOutput = [];
  for (const [metric, stat] of Object.entries(metricResultDict)) {
    switch (metric) {
      case Metrics.SampleSize:
        allMetricsOutput.push({
          key: TotalCohortSamples,
          label: localization.Interpret.Statistics.samples,
          stat
        });
        break;
      case Metrics.AccuracyScore:
        allMetricsOutput.push({
          key: MulticlassClassificationMetrics.Accuracy,
          label: localization.Interpret.Statistics.accuracy,
          stat
        });
        break;
      default:
        break;
    }
  }
  return allMetricsOutput;
}

export function convertRegressionMetrics(
  metricResultDict: Map<string, number>
): ILabeledStatistic[] {
  const allMetricsOutput = [];
  for (const [metric, stat] of Object.entries(metricResultDict)) {
    switch (metric) {
      case Metrics.SampleSize:
        allMetricsOutput.push({
          key: TotalCohortSamples,
          label: localization.Interpret.Statistics.samples,
          stat
        });
        break;
      case Metrics.MeanAbsoluteError:
        allMetricsOutput.push({
          key: RegressionMetrics.MeanAbsoluteError,
          label: localization.Interpret.Statistics.mae,
          stat
        });
        break;
      case Metrics.MeanSquaredError:
        allMetricsOutput.push({
          key: RegressionMetrics.MeanSquaredError,
          label: localization.Interpret.Statistics.mse,
          stat
        });
        break;
      case Metrics.MeanPrediction:
        allMetricsOutput.push({
          key: RegressionMetrics.MeanPrediction,
          label: localization.Interpret.Statistics.meanPrediction,
          stat
        });
        break;
      case Metrics.R2Score:
        allMetricsOutput.push({
          key: RegressionMetrics.RSquared,
          label: localization.Interpret.Statistics.rSquared,
          stat
        });
        break;
      default:
        break;
    }
  }
  return allMetricsOutput;
}

export function generateMetricsCohortsUI(
  context: IModelAssessmentContext,
  errorCohorts: ErrorCohort[]
): ILabeledStatistic[][] {
  return generateMetrics(
    context.jointDataset,
    errorCohorts.map((errorCohort) =>
      errorCohort.cohort.unwrap(JointDataset.IndexLabel)
    ),
    context.modelMetadata.modelType
  );
}

export async function generateMetricsCohortsCombined(
  context: IModelAssessmentContext,
  errorCohorts: ErrorCohort[]
): Promise<ILabeledStatistic[][]> {
  if (ifEnableLargeData(context.dataset) && context.requestMetrics) {
    return generateMetricsCohortsSDK(context, errorCohorts);
  }
  return generateMetricsCohortsUI(context, errorCohorts);
}
