// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  WeightVectorOption,
  ErrorCohort,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  JointDataset,
  ModelExplanationUtils,
  FabricStyles
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Dropdown, IDropdownOption, Stack } from "office-ui-fabric-react";
import React from "react";

import { PredictionTabKeys } from "../ModelAssessmentEnums";
import {
  DataViewKeys,
  HelpMessageDict,
  TabularDataView
} from "@responsible-ai/error-analysis";
import { IGlobalSeries, LocalImportancePlots } from "@responsible-ai/interpret";

export interface ISelectionDetails {
  selectedDatasetIndexes: number[];
  selectedCorrectDatasetIndexes: number[];
  selectedIncorrectDatasetIndexes: number[];
  selectedAllSelectedIndexes: number[];
}

export interface IIndividualFeatureImportanceProps {
  messages?: HelpMessageDict;
  features: string[];
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  onWeightChange: (option: WeightVectorOption) => void;
  selectedCohort: ErrorCohort;
}

export interface IIndividualFeatureImportanceState {
  selectionDetails: ISelectionDetails;
  activePredictionTab: PredictionTabKeys;
  featureImportances: IGlobalSeries[];
  sortArray: number[];
  sortingSeriesIndex?: number;
}

export class IndividualFeatureImportanceView extends React.Component<
  IIndividualFeatureImportanceProps,
  IIndividualFeatureImportanceState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  private dropdownItems: IDropdownOption[] = [];
  public constructor(props: IIndividualFeatureImportanceProps) {
    super(props);
    this.state = {
      selectionDetails: {
        selectedAllSelectedIndexes: [],
        selectedCorrectDatasetIndexes: [],
        selectedDatasetIndexes: [],
        selectedIncorrectDatasetIndexes: []
      },
      activePredictionTab: PredictionTabKeys.AllSelectedTab,
      featureImportances: [],
      sortArray: []
    };

    this.dropdownItems.push({
      key: PredictionTabKeys.CorrectPredictionTab,
      text: localization.ErrorAnalysis.correctPrediction
    });
    this.dropdownItems.push({
      key: PredictionTabKeys.IncorrectPredictionTab,
      text: localization.ErrorAnalysis.incorrectPrediction
    });
    this.dropdownItems.push({
      key: PredictionTabKeys.AllSelectedTab,
      text: localization.ErrorAnalysis.allSelected
    });
  }

  public render(): React.ReactNode {
    let dataView: DataViewKeys;
    let selectedIndexes: number[];
    let setSelectedIndexes: (indexes: number[]) => void;
    if (
      this.state.activePredictionTab === PredictionTabKeys.CorrectPredictionTab
    ) {
      dataView = DataViewKeys.CorrectInstances;
      selectedIndexes = this.state.selectionDetails
        .selectedCorrectDatasetIndexes;
      setSelectedIndexes = this.setCorrectSelectedIndexes.bind(this);
    } else if (
      this.state.activePredictionTab ===
      PredictionTabKeys.IncorrectPredictionTab
    ) {
      dataView = DataViewKeys.IncorrectInstances;
      selectedIndexes = this.state.selectionDetails
        .selectedIncorrectDatasetIndexes;
      setSelectedIndexes = this.setIncorrectSelectedIndexes.bind(this);
    } else {
      // show all
      dataView = DataViewKeys.SelectedInstances;
      selectedIndexes = this.state.selectionDetails.selectedAllSelectedIndexes;
      setSelectedIndexes = this.updateAllSelectedIndexes.bind(this);
    }

    const testableDatapoints = this.state.featureImportances.map(
      (item) => item.unsortedFeatureValues as any[]
    );
    const testableDatapointColors = this.state.featureImportances.map(
      (item) => FabricStyles.fabricColorPalette[item.colorIndex]
    );
    const testableDatapointNames = this.state.featureImportances.map(
      (item) => item.name
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
      });

    return (
      <Stack tokens={{ padding: "15px 38px 0 38px", childrenGap: "10px" }}>
        <Dropdown
          selectedKey={this.state.activePredictionTab}
          options={this.dropdownItems}
          onChange={this.onDropdownSelectionChange.bind(this)}
          styles={{ dropdown: { width: 180 } }}
        />
        <div className="tabularDataView">
          <TabularDataView
            features={this.context.modelMetadata.featureNames}
            jointDataset={this.context.jointDataset}
            messages={this.props.messages}
            dataView={dataView}
            selectedIndexes={selectedIndexes}
            setSelectedIndexes={setSelectedIndexes}
            selectedCohort={this.props.selectedCohort}
          />
        </div>
        <LocalImportancePlots
          includedFeatureImportance={this.state.featureImportances}
          jointDataset={this.context.jointDataset}
          metadata={this.context.modelMetadata}
          selectedWeightVector={this.props.selectedWeightVector}
          weightOptions={this.props.weightOptions}
          weightLabels={this.props.weightLabels}
          testableDatapoints={testableDatapoints}
          testableDatapointColors={testableDatapointColors}
          testableDatapointNames={testableDatapointNames}
          featuresOption={featuresOption}
          sortArray={this.state.sortArray}
          sortingSeriesIndex={this.state.sortingSeriesIndex}
          invokeModel={this.props.invokeModel}
          onWeightChange={this.props.onWeightChange}
        />
      </Stack>
    );
  }

  private onDropdownSelectionChange(
    _?: React.FormEvent<HTMLElement | HTMLInputElement>,
    option?: IDropdownOption
  ): void {
    if (option) {
      let selectedCorrectIndexes = this.state.selectionDetails
        .selectedCorrectDatasetIndexes;
      let selectedIncorrectIndexes = this.state.selectionDetails
        .selectedIncorrectDatasetIndexes;
      // If going from AllSelectedTab, need to update the other arrays
      if (this.state.activePredictionTab === PredictionTabKeys.AllSelectedTab) {
        selectedCorrectIndexes = selectedCorrectIndexes.filter((index) =>
          this.state.selectionDetails.selectedAllSelectedIndexes.includes(index)
        );
        selectedIncorrectIndexes = selectedIncorrectIndexes.filter((index) =>
          this.state.selectionDetails.selectedAllSelectedIndexes.includes(index)
        );
      }
      const selectedIndexes = [
        ...selectedCorrectIndexes,
        ...selectedIncorrectIndexes
      ];
      this.setState({
        selectionDetails: {
          selectedAllSelectedIndexes: this.state.selectionDetails
            .selectedAllSelectedIndexes,
          selectedCorrectDatasetIndexes: selectedCorrectIndexes,
          selectedDatasetIndexes: selectedIndexes,
          selectedIncorrectDatasetIndexes: selectedIncorrectIndexes
        },
        activePredictionTab: PredictionTabKeys[option.key]
      });
    }
  }

  private setCorrectSelectedIndexes(indexes: number[]): void {
    const reloadDataFunc = (
      state: Readonly<IIndividualFeatureImportanceState>
    ): IIndividualFeatureImportanceState => {
      let selectionDetails = state.selectionDetails;
      const selectedCorrectIndexes = indexes;
      const selectedIncorrectIndexes =
        selectionDetails.selectedIncorrectDatasetIndexes;
      const selectedIndexes = [
        ...selectedCorrectIndexes,
        ...selectedIncorrectIndexes
      ];
      selectionDetails = {
        selectedAllSelectedIndexes: selectedIndexes,
        selectedCorrectDatasetIndexes: selectedCorrectIndexes,
        selectedDatasetIndexes: selectedIndexes,
        selectedIncorrectDatasetIndexes: selectedIncorrectIndexes
      } as ISelectionDetails;
      return this.updateViewedFeatureImportances(
        selectionDetails,
        PredictionTabKeys.CorrectPredictionTab
      );
    };
    this.setState(reloadDataFunc);
  }

  private setIncorrectSelectedIndexes(indexes: number[]): void {
    const reloadDataFunc = (
      state: Readonly<IIndividualFeatureImportanceState>
    ): IIndividualFeatureImportanceState => {
      let selectionDetails = state.selectionDetails;
      const selectedCorrectIndexes =
        selectionDetails.selectedCorrectDatasetIndexes;
      const selectedIncorrectIndexes = indexes;
      const selectedIndexes = [
        ...selectedCorrectIndexes,
        ...selectedIncorrectIndexes
      ];
      selectionDetails = {
        selectedAllSelectedIndexes: selectedIndexes,
        selectedCorrectDatasetIndexes: selectedCorrectIndexes,
        selectedDatasetIndexes: selectedIndexes,
        selectedIncorrectDatasetIndexes: selectedIncorrectIndexes
      } as ISelectionDetails;
      return this.updateViewedFeatureImportances(
        selectionDetails,
        PredictionTabKeys.IncorrectPredictionTab
      );
    };
    this.setState(reloadDataFunc);
  }

  private updateAllSelectedIndexes(indexes: number[]): void {
    const reloadDataFunc = (
      state: Readonly<IIndividualFeatureImportanceState>
    ): IIndividualFeatureImportanceState => {
      let selectionDetails = state.selectionDetails;
      selectionDetails = {
        selectedAllSelectedIndexes: indexes,
        selectedCorrectDatasetIndexes:
          selectionDetails.selectedCorrectDatasetIndexes,
        selectedDatasetIndexes: selectionDetails.selectedDatasetIndexes,
        selectedIncorrectDatasetIndexes:
          selectionDetails.selectedIncorrectDatasetIndexes
      } as ISelectionDetails;
      return this.updateViewedFeatureImportances(
        selectionDetails,
        PredictionTabKeys.AllSelectedTab
      );
    };
    this.setState(reloadDataFunc);
  }

  private updateViewedFeatureImportances(
    selectionDetails: ISelectionDetails,
    activePredictionTab: PredictionTabKeys
  ): IIndividualFeatureImportanceState {
    const includedIndexes = selectionDetails.selectedAllSelectedIndexes;
    const inspectedFeatureImportance = selectionDetails.selectedAllSelectedIndexes.map(
      (rowIndex, colorIndex): IGlobalSeries => {
        const row = this.context.jointDataset.getRow(rowIndex);
        return {
          colorIndex,
          id: rowIndex,
          name: localization.formatString(
            localization.Interpret.WhatIfTab.rowLabel,
            rowIndex.toString()
          ),
          unsortedAggregateY: JointDataset.localExplanationSlice(
            row,
            this.context.jointDataset.localExplanationFeatureCount
          ) as number[],
          unsortedFeatureValues: JointDataset.datasetSlice(
            row,
            this.context.jointDataset.metaDict,
            this.context.jointDataset.datasetFeatureCount
          )
        };
      }
    );
    const featureImportances = inspectedFeatureImportance.filter((row) => {
      if (row.id !== undefined) {
        return includedIndexes.includes(row.id);
      }
      return false;
    });
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
      sortingSeriesIndex,
      selectionDetails,
      activePredictionTab
    };
  }
}
