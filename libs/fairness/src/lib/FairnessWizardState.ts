// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PredictionTypes } from "@responsible-ai/core-ui";
import { RangeTypes } from "@responsible-ai/mlchartlib";

import { IFairnessProps } from "./IFairnessProps";
import {
  IFairnessOption,
  defaultFairnessMetricPrioritization,
  fairnessOptions
} from "./util/FairnessMetrics";
import { IBinnedResponse } from "./util/IBinnedResponse";
import {
  IFairnessContext,
  IRunTimeFairnessContext
} from "./util/IFairnessContext";
import { MetricsCache } from "./util/MetricsCache";
import {
  defaultPerformanceMetricPrioritization,
  IPerformanceOption,
  performanceOptions
} from "./util/PerformanceMetrics";
import { WizardBuilder } from "./util/WizardBuilder";

export const introTabKey = "introTab";
export const featureBinTabKey = "featureBinTab";
export const performanceTabKey = "performanceTab";
export const fairnessTabKey = "fairnessTab";
export const reportTabKey = "reportTab";

export const flights = {
  skipFairness: false
};

export interface IWizardStateV2 {
  showIntro: boolean;
  activeTabKey: string;
  selectedModelId?: number;
  dashboardContext: IFairnessContext;
  performanceMetrics: IPerformanceOption[];
  fairnessMetrics: IFairnessOption[];
  selectedPerformanceKey: string | undefined;
  selectedFairnessKey: string | undefined;
  errorBarsEnabled: boolean;
  featureBins: IBinnedResponse[];
  selectedBinIndex: number;
  metricCache: MetricsCache;
}

function getPerformanceMetrics(
  fairnessContext: IRunTimeFairnessContext,
  props: IFairnessProps
): IPerformanceOption[] {
  if (
    fairnessContext.modelMetadata.PredictionType ===
    PredictionTypes.BinaryClassification
  ) {
    return props.supportedBinaryClassificationPerformanceKeys.map(
      (key) => performanceOptions[key]
    );
  }
  if (
    fairnessContext.modelMetadata.PredictionType === PredictionTypes.Regression
  ) {
    return props.supportedRegressionPerformanceKeys.map(
      (key) => performanceOptions[key]
    );
  }
  return props.supportedProbabilityPerformanceKeys.map(
    (key) => performanceOptions[key]
  );
}
function getFairnessMetrics(
  fairnessContext: IRunTimeFairnessContext
): IFairnessOption[] {
  return Object.values(fairnessOptions).filter((fairnessOption) => {
    return fairnessOption.supportedTasks.has(
      fairnessContext.modelMetadata.PredictionType
    );
  });
}
function selectDefaultMetric(
  metrics: { [key: string]: any },
  prioritization: string[]
): string | undefined {
  const keys = new Set(Object.values(metrics).map((metric) => metric.key));
  for (const metricKey of prioritization) {
    if (keys.has(metricKey)) {
      return metricKey;
    }
  }

  // if none of the prioritized default metrics are available return first item
  return Object.values(metrics)[0]?.key;
}
export function getFairnessWizardState(props: IFairnessProps): IWizardStateV2 {
  let performanceMetrics: IPerformanceOption[];
  let fairnessMetrics: IFairnessOption[];
  let selectedPerformanceKey: string | undefined;
  let selectedFairnessKey: string | undefined;
  // handle the case of precomputed metrics separately. As it becomes more defined, can integrate with existing code path.
  if (props.precomputedMetrics && props.precomputedFeatureBins) {
    // we must assume that the same performance metrics are provided across models and bins
    performanceMetrics =
      WizardBuilder.buildPerformanceListForPrecomputedMetrics(props);
    fairnessMetrics =
      WizardBuilder.buildFairnessListForPrecomputedMetrics(props);
    const readonlyFeatureBins = props.precomputedFeatureBins.map(
      (initialBin, index) => {
        return {
          array: initialBin.binLabels,
          featureIndex: index,
          hasError: false,
          labelArray: initialBin.binLabels,
          rangeType: RangeTypes.Categorical
        };
      }
    );
    selectedPerformanceKey = selectDefaultMetric(
      performanceMetrics,
      defaultPerformanceMetricPrioritization
    );
    selectedFairnessKey = selectDefaultMetric(
      fairnessMetrics,
      defaultFairnessMetricPrioritization
    );

    return {
      activeTabKey: featureBinTabKey,
      dashboardContext: WizardBuilder.buildPrecomputedFairnessContext(props),
      errorBarsEnabled: props.errorBarsEnabled ?? false,
      fairnessMetrics,
      featureBins: readonlyFeatureBins,
      metricCache: new MetricsCache(0, 0, undefined, props.precomputedMetrics),
      performanceMetrics,
      selectedBinIndex: 0,
      selectedFairnessKey,
      selectedModelId: props.predictedY.length === 1 ? 0 : undefined,
      selectedPerformanceKey,
      showIntro: true
    };
  }
  const fairnessContext = WizardBuilder.buildInitialFairnessContext(props);

  const featureBins = WizardBuilder.buildFeatureBins(fairnessContext);
  if (featureBins.length > 0) {
    fairnessContext.binVector = WizardBuilder.generateBinVectorForBin(
      featureBins[0],
      fairnessContext.dataset
    );
    fairnessContext.groupNames = featureBins[0].labelArray;
  }

  performanceMetrics = getPerformanceMetrics(fairnessContext, props);
  performanceMetrics = performanceMetrics.filter((metric) => !!metric);
  selectedPerformanceKey = selectDefaultMetric(
    performanceMetrics,
    defaultPerformanceMetricPrioritization
  );

  fairnessMetrics = getFairnessMetrics(fairnessContext);
  fairnessMetrics = fairnessMetrics.filter((metric) => !!metric);
  selectedFairnessKey = selectDefaultMetric(
    fairnessMetrics,
    defaultFairnessMetricPrioritization
  );

  return {
    activeTabKey: introTabKey,
    dashboardContext: fairnessContext,
    errorBarsEnabled: props.errorBarsEnabled ?? false,
    fairnessMetrics,
    featureBins,
    metricCache: new MetricsCache(
      featureBins.length,
      props.predictedY.length,
      props.requestMetrics
    ),
    performanceMetrics,
    selectedBinIndex: 0,
    selectedFairnessKey,
    selectedModelId: props.predictedY.length === 1 ? 0 : undefined,
    selectedPerformanceKey,
    showIntro: true
  };
}
