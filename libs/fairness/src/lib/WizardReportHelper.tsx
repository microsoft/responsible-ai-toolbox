// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IMetricResponse,
  PredictionTypes,
  IFairnessResponse,
  IBounds
} from "@responsible-ai/core-ui";
import { Dictionary } from "lodash";

import {
  IPerformancePickerPropsV2,
  IFairnessPickerPropsV2,
  IErrorPickerProps,
  IFeatureBinPickerPropsV2
} from "./FairnessWizard";
import { IMetrics } from "./IMetrics";
import { FairnessModes, fairnessOptions } from "./util/FairnessMetrics";
import { IFairnessContext } from "./util/IFairnessContext";
import { MetricsCache } from "./util/MetricsCache";

export async function loadMetrics(
  dashboardContext: IFairnessContext,
  metricsCache: MetricsCache,
  performancePickerProps: IPerformancePickerPropsV2,
  fairnessPickerProps: IFairnessPickerPropsV2,
  errorPickerProps: IErrorPickerProps,
  featureBinPickerProps: IFeatureBinPickerPropsV2,
  selectedModelIndex: number
): Promise<IMetrics | undefined> {
  try {
    let falsePositiveRates: IMetricResponse | undefined;
    let falseNegativeRates: IMetricResponse | undefined;
    let overpredictions: IMetricResponse | undefined;
    let underpredictions: IMetricResponse | undefined;
    let predictions: number[] | undefined;
    let errors: number[] | undefined;
    let outcomes: IMetricResponse;

    const disparities: Dictionary<number> = {};
    const disparityBounds: Dictionary<IBounds> = {};
    const performance = await getMetric(
      performancePickerProps.selectedPerformanceKey,
      errorPickerProps.errorBarsEnabled,
      dashboardContext,
      metricsCache,
      featureBinPickerProps,
      selectedModelIndex
    );
    // TODO: extend disparities to query for all possible kinds of disparities
    // https://github.com/microsoft/responsible-ai-widgets/issues/65
    const fairnessResponse: IFairnessResponse = await getFairnessMetric(
      fairnessPickerProps.selectedFairnessKey,
      fairnessOptions[fairnessPickerProps.selectedFairnessKey].fairnessMode,
      errorPickerProps.errorBarsEnabled,
      dashboardContext,
      metricsCache,
      featureBinPickerProps,
      selectedModelIndex
    );
    disparities[fairnessPickerProps.selectedFairnessKey] =
      fairnessResponse.overall;
    if (fairnessResponse.bounds) {
      disparityBounds[fairnessPickerProps.selectedFairnessKey] =
        fairnessResponse.bounds;
    }
    switch (dashboardContext.modelMetadata.PredictionType) {
      case PredictionTypes.BinaryClassification: {
        falseNegativeRates = await getMetric(
          "miss_rate",
          errorPickerProps.errorBarsEnabled,
          dashboardContext,
          metricsCache,
          featureBinPickerProps,
          selectedModelIndex
        );
        falsePositiveRates = await getMetric(
          "fallout_rate",
          errorPickerProps.errorBarsEnabled,
          dashboardContext,
          metricsCache,
          featureBinPickerProps,
          selectedModelIndex
        );
        outcomes = await getMetric(
          "selection_rate",
          errorPickerProps.errorBarsEnabled,
          dashboardContext,
          metricsCache,
          featureBinPickerProps,
          selectedModelIndex
        );
        break;
      }
      case PredictionTypes.Probability: {
        predictions = dashboardContext.predictions[selectedModelIndex];
        overpredictions = await getMetric(
          "overprediction",
          errorPickerProps.errorBarsEnabled,
          dashboardContext,
          metricsCache,
          featureBinPickerProps,
          selectedModelIndex
        );
        underpredictions = await getMetric(
          "underprediction",
          errorPickerProps.errorBarsEnabled,
          dashboardContext,
          metricsCache,
          featureBinPickerProps,
          selectedModelIndex
        );
        outcomes = await getMetric(
          "average",
          errorPickerProps.errorBarsEnabled,
          dashboardContext,
          metricsCache,
          featureBinPickerProps,
          selectedModelIndex
        );
        break;
      }
      case PredictionTypes.Regression:
      default: {
        predictions = dashboardContext.predictions[selectedModelIndex];
        errors = predictions.map((predicted, index) => {
          return predicted - dashboardContext.trueY[index];
        });
        outcomes = await getMetric(
          "average",
          errorPickerProps.errorBarsEnabled,
          dashboardContext,
          metricsCache,
          featureBinPickerProps,
          selectedModelIndex
        );
        break;
      }
    }
    const metrics = {
      disparities,
      disparityBounds,
      errors,
      falseNegativeRates,
      falsePositiveRates,
      outcomes,
      overpredictions,
      performance,
      predictions,
      underpredictions
    };

    return metrics;
  } catch {
    return undefined;
    // todo;
  }
}

export function getOutcomeKey(dashboardContext: IFairnessContext): string {
  return dashboardContext.modelMetadata.PredictionType ===
    PredictionTypes.BinaryClassification
    ? "selection_rate"
    : "average";
}

async function getMetric(
  metricName: string,
  errorBarsEnabled: boolean,
  dashboardContext: IFairnessContext,
  metricsCache: MetricsCache,
  featureBinPickerProps: IFeatureBinPickerPropsV2,
  selectedModelIndex: number
): Promise<IMetricResponse> {
  return await metricsCache.getMetric(
    dashboardContext.binVector,
    featureBinPickerProps.selectedBinIndex,
    selectedModelIndex,
    metricName,
    errorBarsEnabled
  );
}

async function getFairnessMetric(
  metricName: string,
  fairnessMode: FairnessModes,
  errorBarsEnabled: boolean,
  dashboardContext: IFairnessContext,
  metricsCache: MetricsCache,
  featureBinPickerProps: IFeatureBinPickerPropsV2,
  selectedModelIndex: number
): Promise<IFairnessResponse> {
  return await metricsCache.getFairnessMetric(
    dashboardContext.binVector,
    featureBinPickerProps.selectedBinIndex,
    selectedModelIndex,
    metricName,
    fairnessMode,
    errorBarsEnabled
  );
}
