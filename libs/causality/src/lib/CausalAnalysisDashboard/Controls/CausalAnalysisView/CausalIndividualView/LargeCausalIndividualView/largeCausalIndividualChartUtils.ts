// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption } from "@fluentui/react";
import {
  calculateBubblePlotDataFromErrorCohort,
  Cohort,
  FluentUIStyles,
  hasAxisTypeUpdated,
  ICausalAnalysisData,
  ICausalAnalysisSingleData,
  IClusterData,
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
import { localization } from "@responsible-ai/localization";
import _ from "lodash";

import { CausalIndividualConstants } from "../CausalIndividualConstants";

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
    isLocalCausalDataLoading,
    true,
    false,
    TelemetryEventName.CausalBubblePlotDataFetch,
    requestBubblePlotData,
    selectPointFromChartLargeData,
    onBubbleClick,
    undefined,
    telemetryHook
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
    !_.isEqual(
      prevState.isRevertButtonClicked,
      currentState.isRevertButtonClicked
    );
  const hasCohortUpdated = !_.isEqual(
    currentProps.cohort.name,
    prevProps.cohort.name
  );
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
    } else if (hasAxisTypeChanged) {
      updateScatterPlotData(chartProps);
    } else if (hasChartPropsUpdated) {
      updateBubblePlotData(chartProps, false);
    } else if (
      hasSelectedPointIndexesUpdated ||
      hasIsLocalExplanationsDataLoadingUpdated
    ) {
      updateScatterPlotData(chartProps);
    }
  }
}

export async function selectPointFromChartLargeData(
  data: IScatterPoint,
  setLocalCausalData: (absoluteIndex: number) => Promise<void>,
  toggleSelectionOfPoint: (index?: number) => number[] | undefined,
  onDataClick: (
    isLocalCausalDataLoading: boolean,
    data?: ICausalAnalysisData
  ) => void,
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
    onDataClick(false, undefined);
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

export function getTemporaryPoint(
  jointDataset: JointDataset,
  index: number,
  absoluteIndex: number
): { [key: string]: any } {
  return {
    ...jointDataset.getRow(index),
    [CausalIndividualConstants.namePath]: localization.formatString(
      localization.Interpret.WhatIf.defaultCustomRootName,
      index
    ),
    [CausalIndividualConstants.colorPath]:
      FluentUIStyles.fluentUIColorPalette[
        CausalIndividualConstants.MAX_SELECTION
      ],
    [absoluteIndexKey]: absoluteIndex,
    [indexKey]: index
  };
}

export function selectPointFromDropdownIntl(
  setTemporaryPointToCopyOfDatasetPoint: (
    index: number,
    absoluteIndex: number
  ) => void,
  toggleSelectionOfPoint: (index?: number) => number[] | undefined,
  setLocalCausalData: (absoluteIndex: number) => Promise<void>,
  onDataClick: (
    isLocalCausalDataLoading: boolean,
    data?: ICausalAnalysisData
  ) => void,
  item?: IComboBoxOption,
  telemetryHook?: ((message: ITelemetryEvent) => void) | undefined
): void {
  if (typeof item?.key === "string") {
    const index = Number.parseInt(item.key);
    setTemporaryPointToCopyOfDatasetPoint(index, item.data.index);
    const newSelections = toggleSelectionOfPoint(index);
    if (newSelections && newSelections.length > 0) {
      setLocalCausalData(item.data.index);
    } else {
      onDataClick(false, undefined);
    }
    telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.IndividualCausalSelectedDatapointUpdatedFromDropdown
    });
  }
}
