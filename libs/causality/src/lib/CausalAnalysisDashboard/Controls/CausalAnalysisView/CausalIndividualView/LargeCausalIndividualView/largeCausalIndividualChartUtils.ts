// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption } from "@fluentui/react";
import {
  calculateBubblePlotDataFromErrorCohort,
  Cohort,
  hasAxisTypeUpdated,
  ICausalAnalysisSingleData,
  IDataset,
  IGenericChartProps,
  IHighchartBubbleSDKClusterData,
  IHighchartsConfig,
  IScatterPoint,
  ISelectorConfig,
  ITelemetryEvent,
  JointDataset,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";
import _ from "lodash";

import {
  ILargeCausalIndividualChartProps,
  ILargeCausalIndividualChartState
} from "./ILargeCausalIndividualChartSpec";

export const absoluteIndexKey = "AbsoluteIndex";
export const indexKey = "Index";

export async function getBubblePlotData(
  chartProps: IGenericChartProps,
  cohort: Cohort,
  jointDataset: JointDataset,
  dataset: IDataset,
  isLocalCausalDataLoading?: boolean,
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
    xSeries: number[],
    ySeries: number[],
    indexSeries: number[]
  ) => void
): Promise<IHighchartBubbleSDKClusterData | IHighchartsConfig | undefined> {
  return await calculateBubblePlotDataFromErrorCohort(
    cohort,
    chartProps,
    [],
    jointDataset,
    dataset,
    isLocalCausalDataLoading,
    true,
    false,
    requestBubblePlotData,
    selectPointFromChartLargeData,
    onBubbleClick,
    undefined
  );
}

export function shouldUpdateHighchart(
  prevState: ILargeCausalIndividualChartState,
  prevProps: ILargeCausalIndividualChartProps,
  currentState: ILargeCausalIndividualChartState,
  currentProps: ILargeCausalIndividualChartProps,
  changedKeys: string[]
): [boolean, boolean, boolean, boolean, boolean, boolean, boolean] {
  const hasSelectedPointIndexesUpdated = !_.isEqual(
    currentState.selectedPointsIndexes,
    prevState.selectedPointsIndexes
  );
  const hasIsLocalExplanationsDataLoadingUpdated = !_.isEqual(
    currentState.isLocalCausalDataLoading,
    prevState.isLocalCausalDataLoading
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
  updateBubblePlotData: (chartProps: IGenericChartProps) => void,
  updateScatterPlotData: (chartProps: IGenericChartProps) => void
): Promise<void> {
  if (chartProps) {
    if (hasCohortUpdated || hasRevertToBubbleChartUpdated) {
      updateBubblePlotData(chartProps);
      return;
    }
    if (hasAxisTypeChanged) {
      updateScatterPlotData(chartProps);
      return;
    }
    if (hasChartPropsUpdated) {
      updateBubblePlotData(chartProps);
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

export async function selectPointFromChartLargeData(
  data: IScatterPoint,
  setLocalCausalData: (absoluteIndex: number) => Promise<void>,
  toggleSelectionOfPoint: (index?: number) => number[] | undefined,
  onDataClick: (data: any, isLocalCausalDataLoading: boolean) => void,
  setTemporaryPointToCopyOfDatasetPoint: (
    index: number,
    absoluteIndex: number
  ) => void,
  telemetryHook?: ((message: ITelemetryEvent) => void) | undefined
): Promise<void> {
  const index = data.customData[JointDataset.IndexLabel];
  const absoluteIndex = data.customData[JointDataset.AbsoluteIndexLabel];
  index &&
    absoluteIndex &&
    setTemporaryPointToCopyOfDatasetPoint(index, absoluteIndex);
  const newSelections = toggleSelectionOfPoint(index);
  if (absoluteIndex && newSelections && newSelections.length > 0) {
    setLocalCausalData(absoluteIndex);
  } else {
    onDataClick(undefined, false);
  }
  telemetryHook?.({
    level: TelemetryLevels.ButtonClick,
    type: TelemetryEventName.FeatureImportancesNewDatapointSelectedFromChart
  });
}

export function instanceOfLocalCausalData(
  object: any
): object is ICausalAnalysisSingleData[] {
  return "local_effects" in object;
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

export function getDataOptions(indexSeries: number[]): IComboBoxOption[] {
  const options = indexSeries.map((_ind, i) => {
    return {
      data: { index: indexSeries[i] },
      key: `${i}`,
      text: `Index ${i}`
    };
  });
  return options;
}

export function getErrorMessage(datasetBarConfigOverride: any): string {
  return datasetBarConfigOverride.toString().split(":").pop();
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
