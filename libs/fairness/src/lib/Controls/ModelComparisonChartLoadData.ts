// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBounds } from "@responsible-ai/core-ui";

import {
  IPerformancePickerPropsV2,
  IFairnessPickerPropsV2,
  IErrorPickerProps,
  IFeatureBinPickerPropsV2
} from "../FairnessWizard";
import { fairnessOptions } from "../util/FairnessMetrics";
import { IFairnessContext } from "../util/IFairnessContext";
import { MetricsCache } from "../util/MetricsCache";

export interface IModelComparisonChartData {
  performanceArray?: number[];
  performanceBounds?: Array<IBounds | undefined>;
  fairnessArray?: number[];
  fairnessBounds?: Array<IBounds | undefined>;
}

export async function ModelComparisonChartLoadData(
  dashboardContext: IFairnessContext,
  metricsCache: MetricsCache,
  performancePickerProps: IPerformancePickerPropsV2,
  fairnessPickerProps: IFairnessPickerPropsV2,
  errorPickerProps: IErrorPickerProps,
  featureBinPickerProps: IFeatureBinPickerPropsV2,
  modelCount: number
): Promise<IModelComparisonChartData | undefined> {
  try {
    const performancePromises = new Array(modelCount)
      .fill(0)
      .map((_, modelIndex) => {
        return metricsCache.getMetric(
          dashboardContext.binVector,
          featureBinPickerProps.selectedBinIndex,
          modelIndex,
          performancePickerProps.selectedPerformanceKey,
          errorPickerProps.errorBarsEnabled
        );
      });
    const fairnessOption =
      fairnessOptions[fairnessPickerProps.selectedFairnessKey];
    const fairnessPromises = new Array(modelCount)
      .fill(0)
      .map((_, modelIndex) => {
        return metricsCache.getFairnessMetric(
          dashboardContext.binVector,
          featureBinPickerProps.selectedBinIndex,
          modelIndex,
          fairnessPickerProps.selectedFairnessKey,
          fairnessOption.fairnessMode,
          errorPickerProps.errorBarsEnabled
        );
      });

    const performanceResponse = await Promise.all(performancePromises);
    const fairnessResponse = await Promise.all(fairnessPromises);

    const performanceArray = performanceResponse.map((metric) => {
      return metric.global;
    });

    const performanceBounds = performanceResponse.map((metric) => {
      return metric.bounds;
    });

    const fairnessArray = fairnessResponse.map((metric) => {
      return metric.overall;
    });

    const fairnessBounds = fairnessResponse.map((metric) => {
      return metric.bounds;
    });

    return {
      fairnessArray,
      fairnessBounds,
      performanceArray,
      performanceBounds
    };
  } catch {
    return undefined;
    // todo;
  }
}
