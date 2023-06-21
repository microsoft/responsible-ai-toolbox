// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  IDataset,
  IGenericChartProps,
  IHighchartBubbleSDKClusterData,
  IHighchartsConfig,
  ILocalExplanations,
  IScatterPoint,
  ISelectorConfig,
  ITelemetryEvent,
  JointDataset,
  TelemetryEventName,
  TelemetryLevels,
  hasAxisTypeChanged,
  IClusterData,
  calculateBubblePlotDataFromErrorCohort
} from "@responsible-ai/core-ui";
import _ from "lodash";

import {
  ILargeIndividualFeatureImportanceViewProps,
  ILargeIndividualFeatureImportanceViewState
} from "./ILargeIndividualFeatureImportanceViewSpec";

export function instanceOfLocalExplanation(
  object: any
): object is ILocalExplanations {
  return "method" in object;
}

export function shouldUpdateHighchart(
  prevState: ILargeIndividualFeatureImportanceViewState,
  prevProps: ILargeIndividualFeatureImportanceViewProps,
  currentState: ILargeIndividualFeatureImportanceViewState,
  currentProps: ILargeIndividualFeatureImportanceViewProps,
  changedKeys: string[]
): [boolean, boolean, boolean, boolean, boolean, boolean, boolean] {
  const hasSelectedPointIndexesUpdated = !_.isEqual(
    currentState.selectedPointsIndexes,
    prevState.selectedPointsIndexes
  );
  const hasIsLocalExplanationsDataLoadingUpdated = !_.isEqual(
    currentState.isLocalExplanationsDataLoading,
    prevState.isLocalExplanationsDataLoading
  );
  const hasRevertToBubbleChartUpdated =
    currentState.isRevertButtonClicked &&
    prevState.isRevertButtonClicked !== currentState.isRevertButtonClicked;
  const hasCohortUpdated = currentProps.cohort.name !== prevProps.cohort.name;
  const hasChartPropsUpdated = !_.isEqual(
    currentState.chartProps,
    prevState.chartProps
  );
  const hasAxisTypeChanged = hasAxisTypeUpdated(
    changedKeys,
    prevState.chartProps,
    currentState.chartProps
  );

  const shouldUpdate =
    hasRevertToBubbleChartUpdated ||
    hasSelectedPointIndexesUpdated ||
    hasChartPropsUpdated ||
    hasIsLocalExplanationsDataLoadingUpdated ||
    hasCohortUpdated ||
    hasAxisTypeChanged;
  return [
    shouldUpdate,
    hasSelectedPointIndexesUpdated,
    hasIsLocalExplanationsDataLoadingUpdated,
    hasRevertToBubbleChartUpdated,
    hasCohortUpdated,
    hasChartPropsUpdated,
    hasAxisTypeChanged
  ];
}

export async function generateHighChartConfigOverride(
  chartProps: IGenericChartProps | undefined,
  hasSelectedPointIndexesUpdated: boolean,
  hasIsLocalExplanationsDataLoadingUpdated: boolean,
  hasRevertToBubbleChartUpdated: boolean,
  hasChartPropsUpdated: boolean,
  hasCohortUpdated: boolean,
  hasAxisTypeChanged: boolean,
  updateBubblePlotData: (
    chartProps: IGenericChartProps,
    hasRevertToBubbleChartUpdated: boolean
  ) => void,
  updateScatterPlotData: (chartProps: IGenericChartProps) => void
): Promise<void> {
  if (chartProps) {
    if (hasCohortUpdated || hasRevertToBubbleChartUpdated) {
      updateBubblePlotData(chartProps, hasRevertToBubbleChartUpdated);
      return;
    }
    if (hasAxisTypeChanged) {
      updateScatterPlotData(chartProps);
      return;
    }
    if (hasChartPropsUpdated) {
      updateBubblePlotData(chartProps, false);
      return;
    }
    if (
      hasSelectedPointIndexesUpdated ||
      hasIsLocalExplanationsDataLoadingUpdated
    ) {
      updateScatterPlotData(chartProps);
      return;
    }
  }
}

export function getNewSelections(
  selectedPointsIndexes: number[],
  index?: number
): number[] | undefined {
  if (index === undefined) {
    return;
  }
  const indexOf = selectedPointsIndexes.indexOf(index);
  let newSelections = [...selectedPointsIndexes];
  if (indexOf === -1) {
    newSelections = [index];
  } else {
    newSelections.splice(indexOf, 1);
  }
  return newSelections;
}

export async function selectPointFromChartLargeData(
  data: IScatterPoint,
  setLocalExplanationsData: (absoluteIndex: number) => Promise<void>,
  toggleSelectionOfPoint: (index?: number) => number[] | undefined,
  telemetryHook?: ((message: ITelemetryEvent) => void) | undefined
): Promise<void> {
  const index = data.customData[JointDataset.IndexLabel];
  const absoluteIndex = data.customData[JointDataset.AbsoluteIndexLabel];
  const newSelections = toggleSelectionOfPoint(index);
  if (absoluteIndex && newSelections && newSelections?.length > 0) {
    setLocalExplanationsData(absoluteIndex);
  }
  telemetryHook?.({
    level: TelemetryLevels.ButtonClick,
    type: TelemetryEventName.FeatureImportancesNewDatapointSelectedFromChart
  });
}

export async function getBubblePlotData(
  chartProps: IGenericChartProps,
  cohort: Cohort,
  jointDataset: JointDataset,
  dataset: IDataset,
  isLocalExplanationsDataLoading?: boolean,
  requestBubblePlotData?:
    | ((
        filter: unknown[],
        compositeFilter: unknown[],
        xAxis: string,
        yAxis: string,
        abortSignal: AbortSignal
      ) => Promise<IHighchartBubbleSDKClusterData>)
    | undefined,
  selectPointFromChartLargeData?: (data: IScatterPoint) => Promise<void>,
  onBubbleClick?: (
    scatterPlotData: IHighchartsConfig,
    clusterData: IClusterData
  ) => void,
  telemetryHook?: (message: ITelemetryEvent) => void
): Promise<IHighchartBubbleSDKClusterData | IHighchartsConfig | undefined> {
  return await calculateBubblePlotDataFromErrorCohort(
    cohort,
    chartProps,
    [],
    jointDataset,
    dataset,
    isLocalExplanationsDataLoading,
    true,
    false,
    TelemetryEventName.FeatureImportanceBubblePlotDataFetch,
    requestBubblePlotData,
    selectPointFromChartLargeData,
    onBubbleClick,
    undefined,
    telemetryHook
  );
}

export function getNewChartProps(
  value: ISelectorConfig,
  xSet: boolean,
  chartProps: IGenericChartProps
): IGenericChartProps {
  const newProps = _.cloneDeep(chartProps);
  if (xSet) {
    newProps.xAxis = value;
  } else {
    newProps.yAxis = value;
  }
  return newProps;
}

export function getErrorMessage(datasetBarConfigOverride: any): string {
  return datasetBarConfigOverride.toString().split(":").pop();
}

export function compareChartProps(
  newProps: IGenericChartProps,
  oldProps: IGenericChartProps,
  changedKeys: string[]
): void {
  for (const key in newProps) {
    if (typeof newProps[key] === "object") {
      compareChartProps(newProps[key], oldProps[key], changedKeys);
    }
    if (newProps[key] !== oldProps[key]) {
      changedKeys.push(key);
    }
  }
}

export function hasAxisTypeUpdated(
  changedKeys: string[],
  prevChartProps?: IGenericChartProps,
  currentChartProps?: IGenericChartProps
): boolean {
  if (currentChartProps && prevChartProps) {
    changedKeys = [];
    compareChartProps(prevChartProps, currentChartProps, changedKeys);
    return hasAxisTypeChanged(changedKeys);
  }
  return false;
}
