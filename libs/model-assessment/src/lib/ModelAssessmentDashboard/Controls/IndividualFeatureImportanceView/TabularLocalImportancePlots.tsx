// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption, IObjectWithKey } from "@fluentui/react";
import {
  WeightVectorOption,
  ErrorCohort,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  JointDataset,
  ModelExplanationUtils,
  FluentUIStyles,
  ModelTypes,
  ITelemetryEvent
} from "@responsible-ai/core-ui";
import { IGlobalSeries, LocalImportancePlots } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface ITabularLocalImportancePlotsProps {
  features: string[];
  jointDataset: JointDataset;
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  onWeightChange: (option: WeightVectorOption) => void;
  selectedCohort: ErrorCohort;
  modelType?: ModelTypes;
  selectedItems: IObjectWithKey[];
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface IViewedFeatureImportances {
  featureImportances: IGlobalSeries[];
  sortArray: number[];
  sortingSeriesIndex?: number;
}

export class TabularLocalImportancePlots extends React.Component<ITabularLocalImportancePlotsProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const viewedFeatureImportances = this.getViewedFeatureImportances();
    const featureImportances = viewedFeatureImportances.featureImportances;
    const sortArray = viewedFeatureImportances.sortArray;
    const sortingSeriesIndex = viewedFeatureImportances.sortingSeriesIndex;
    const testableDatapoints = featureImportances.map(
      (item) => item.unsortedFeatureValues as any[]
    );
    const testableDatapointColors = featureImportances.map(
      (item) => FluentUIStyles.fluentUIColorPalette[item.colorIndex]
    );
    const testableDatapointNames = featureImportances.map((item) => item.name);

    const droppedFeatureSet = new Set(
      this.context.jointDataset.datasetMetaData?.featureMetaData?.dropped_features
    );
    const featuresOption: IDropdownOption[] = new Array(
      this.context.jointDataset.datasetFeatureCount
    )
      .fill(0)
      .map((_, index) => {
        const key = JointDataset.DataLabelRoot + index.toString();
        const meta = this.context.jointDataset.metaDict[key];
        const options = meta.isCategorical
          ? meta.sortedCategoricalValues?.map((optionText, index) => {
              return { key: index, text: optionText };
            })
          : undefined;
        return {
          data: {
            categoricalOptions: options,
            fullLabel: meta.label.toLowerCase()
          },
          key,
          text: meta.abbridgedLabel
        };
      })
      .filter((item) => !droppedFeatureSet.has(item.text));

    return (
      <LocalImportancePlots
        includedFeatureImportance={featureImportances}
        jointDataset={this.context.jointDataset}
        metadata={this.context.modelMetadata}
        selectedWeightVector={this.props.selectedWeightVector}
        weightOptions={this.props.weightOptions}
        weightLabels={this.props.weightLabels}
        testableDatapoints={testableDatapoints}
        testableDatapointColors={testableDatapointColors}
        testableDatapointNames={testableDatapointNames}
        featuresOption={featuresOption}
        sortArray={sortArray}
        sortingSeriesIndex={sortingSeriesIndex}
        invokeModel={this.props.invokeModel}
        onWeightChange={this.props.onWeightChange}
        telemetryHook={this.props.telemetryHook}
      />
    );
  }

  private getViewedFeatureImportances(): IViewedFeatureImportances {
    const featureImportances = this.props.selectedItems.map(
      (row, colorIndex): IGlobalSeries => {
        const rowDict = this.props.jointDataset.getRow(row[0]);
        return {
          colorIndex,
          id: rowDict[JointDataset.IndexLabel],
          name: localization.formatString(
            localization.Interpret.WhatIfTab.rowLabel,
            rowDict[JointDataset.IndexLabel].toString()
          ),
          unsortedAggregateY: JointDataset.localExplanationSlice(
            rowDict,
            this.props.jointDataset.localExplanationFeatureCount
          ) as number[],
          unsortedFeatureValues: JointDataset.datasetSlice(
            rowDict,
            this.props.jointDataset.metaDict,
            this.props.jointDataset.datasetFeatureCount
          )
        };
      }
    );
    let sortArray: number[] = [];
    let sortingSeriesIndex: number | undefined;
    if (featureImportances.length !== 0) {
      sortingSeriesIndex = 0;
      sortArray = ModelExplanationUtils.getSortIndices(
        featureImportances[0].unsortedAggregateY
      ).reverse();
    } else {
      sortingSeriesIndex = undefined;
    }
    return {
      featureImportances,
      sortArray,
      sortingSeriesIndex
    };
  }
}
